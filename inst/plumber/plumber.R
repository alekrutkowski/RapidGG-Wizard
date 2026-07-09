# RapidGG Wizard local R backend and static app server.
# Intended for trusted local use: /render evaluates generated R code from the browser UI.

`%||%` <- function(x, y) {
  if (is.null(x) || length(x) == 0 || (length(x) == 1 && is.na(x))) y else x
}

app_dir <- function() {
  env <- Sys.getenv("RAPIDGG_APP_DIR", unset = "")
  if (nzchar(env)) return(normalizePath(env, winslash = "/", mustWork = FALSE))
  system.file("app", package = "rapidggwizard", mustWork = TRUE)
}

index_file <- function() file.path(app_dir(), "index.html")
read_utf8 <- function(path) paste(readLines(path, warn = FALSE, encoding = "UTF-8"), collapse = "\n")

mime_for_format <- function(format) {
  switch(tolower(format),
    svg = "image/svg+xml",
    png = "image/png",
    pdf = "application/pdf",
    jpg = "image/jpeg",
    jpeg = "image/jpeg",
    tiff = "image/tiff",
    emf = "image/x-emf",
    "application/octet-stream"
  )
}

font_rows <- function() {
  families <- c("sans", "serif", "mono")
  notes <- character()

  if (requireNamespace("systemfonts", quietly = TRUE)) {
    sf <- tryCatch(systemfonts::system_fonts(), error = function(e) e)
    if (inherits(sf, "error")) {
      notes <- c(notes, paste("systemfonts:", conditionMessage(sf)))
    } else if (is.data.frame(sf) && "family" %in% names(sf)) {
      families <- c(families, sf$family[!is.na(sf$family) & nzchar(sf$family)])
    }
  } else {
    notes <- c(notes, "Package 'systemfonts' is not installed.")
  }

  if (.Platform$OS.type == "windows") {
    wf <- tryCatch(names(grDevices::windowsFonts()), error = function(e) character())
    families <- c(families, wf)
  }

  families <- sort(unique(families[nzchar(families)]))
  list(
    ok = TRUE,
    fonts = lapply(families, function(x) list(family = jsonlite::unbox(x), source = jsonlite::unbox("local R"))),
    warning = jsonlite::unbox(paste(notes, collapse = "; "))
  )
}

#* @filter rapidgg_headers
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type")
  res$setHeader("Cross-Origin-Opener-Policy", "same-origin")
  res$setHeader("Cross-Origin-Embedder-Policy", "require-corp")
  res$setHeader("Cross-Origin-Resource-Policy", "cross-origin")
  if (identical(req$REQUEST_METHOD, "OPTIONS")) return(list(ok = TRUE))
  plumber::forward()
}

#* RapidGG Wizard browser app
#* @get /
#* @serializer html
function(res) {
  path <- index_file()
  if (!file.exists(path)) {
    res$status <- 404
    return("<h1>RapidGG Wizard</h1><p>The installed browser app was not found.</p>")
  }
  read_utf8(path)
}

#* Health check
#* @get /health
function() {
  list(
    ok = TRUE,
    app = "RapidGG Wizard",
    backend = "local R",
    r_version = R.version.string,
    app_dir = app_dir()
  )
}

#* Installed font families discovered by local R.
#* @get /fonts
function() {
  font_rows()
}

#* Render a generated RapidGG R script and return chart bytes as base64.
#* @post /render
function(req, res) {
  payload <- jsonlite::fromJSON(req$postBody %||% "{}", simplifyVector = FALSE)
  code <- payload$code %||% ""
  format <- tolower(payload$format %||% "svg")

  if (!format %in% c("svg", "png", "pdf", "jpg", "jpeg", "tiff", "emf")) {
    res$status <- 400
    return(list(ok = FALSE, error = paste("Unsupported format:", format)))
  }
  if (!nzchar(code)) {
    res$status <- 400
    return(list(ok = FALSE, error = "No R code was supplied."))
  }

  workdir <- tempfile("rapidgg-")
  dir.create(workdir, recursive = TRUE, showWarnings = FALSE)
  outfile <- file.path(workdir, paste0("plot.", format))
  old_output <- Sys.getenv("RAPIDGG_OUTPUT", unset = NA_character_)
  old_backend <- Sys.getenv("RAPIDGG_BACKEND", unset = NA_character_)
  old_web_font <- Sys.getenv("RAPIDGG_WEB_FONT_CSS", unset = NA_character_)
  oldwd <- getwd()

  on.exit({
    setwd(oldwd)
    if (is.na(old_output)) Sys.unsetenv("RAPIDGG_OUTPUT") else Sys.setenv(RAPIDGG_OUTPUT = old_output)
    if (is.na(old_backend)) Sys.unsetenv("RAPIDGG_BACKEND") else Sys.setenv(RAPIDGG_BACKEND = old_backend)
    if (is.na(old_web_font)) Sys.unsetenv("RAPIDGG_WEB_FONT_CSS") else Sys.setenv(RAPIDGG_WEB_FONT_CSS = old_web_font)
    unlink(workdir, recursive = TRUE, force = TRUE)
  }, add = TRUE)

  setwd(workdir)
  Sys.setenv(RAPIDGG_OUTPUT = outfile, RAPIDGG_BACKEND = "local", RAPIDGG_WEB_FONT_CSS = "")
  env <- new.env(parent = globalenv())
  logs <- character()

  tryCatch({
    logs <- capture.output(eval(parse(text = code), envir = env))
    if (!file.exists(outfile)) stop("The script ran but did not create the expected output file: ", outfile, call. = FALSE)
    bytes <- readBin(outfile, what = "raw", n = file.info(outfile)$size)
    list(ok = TRUE, format = format, mime = mime_for_format(format), data = base64enc::base64encode(bytes), logs = logs)
  }, error = function(e) {
    res$status <- 400
    list(ok = FALSE, error = conditionMessage(e), logs = logs)
  })
}

#* @plumber
function(pr) {
  plumber::pr_static(pr, "/assets", file.path(app_dir(), "assets"))
  plumber::pr_static(pr, "/", app_dir())
  pr
}
