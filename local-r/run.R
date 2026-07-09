# Run RapidGG Wizard from this source tree, falling back to an installed package.

args <- commandArgs(trailingOnly = FALSE)
file_arg <- grep("^--file=", args, value = TRUE)
script_path <- if (length(file_arg)) sub("^--file=", "", file_arg[[1]]) else "local-r/run.R"
root <- normalizePath(file.path(dirname(script_path), ".."), winslash = "/", mustWork = FALSE)
source_plumber <- file.path(root, "inst", "plumber", "plumber.R")
source_app <- file.path(root, "inst", "app")

if (file.exists(source_plumber) && dir.exists(source_app)) {
  if (!requireNamespace("plumber", quietly = TRUE)) {
    stop("Package 'plumber' is required. Run Rscript scripts/install-deps.R first.", call. = FALSE)
  }
  Sys.setenv(RAPIDGG_APP_DIR = normalizePath(source_app, winslash = "/", mustWork = TRUE))
  url <- "http://127.0.0.1:8787"
  message("RapidGG Wizard listening at ", url)
  if (!identical(tolower(Sys.getenv("RAPIDGG_BROWSE", "true")), "false")) {
    message("Opening browser at ", url)
    try(utils::browseURL(url), silent = TRUE)
  }
  plumber::plumb(source_plumber)$run(host = "127.0.0.1", port = 8787)
} else if (requireNamespace("rapidggwizard", quietly = TRUE)) {
  rapidggwizard::run_app(browse = TRUE)
} else {
  stop("Could not find the source app or an installed rapidggwizard package.", call. = FALSE)
}
