# Run RapidGG Wizard from the source tree.

`%||%` <- function(x, y) if (is.null(x) || length(x) == 0 || !nzchar(x)) y else x
args <- commandArgs(trailingOnly = FALSE)
file_arg <- grep("^--file=", args, value = TRUE)
script_path <- if (length(file_arg)) sub("^--file=", "", file_arg[[1]]) else "scripts/run-local.R"
root <- normalizePath(file.path(dirname(script_path), ".."), winslash = "/", mustWork = TRUE)

if (!requireNamespace("plumber", quietly = TRUE)) {
  stop("Package 'plumber' is required. Run Rscript scripts/install-deps.R first.", call. = FALSE)
}

Sys.setenv(RAPIDGG_APP_DIR = normalizePath(file.path(root, "inst", "app"), winslash = "/", mustWork = TRUE))
url <- "http://127.0.0.1:8787"
message("RapidGG Wizard listening at ", url)
if (!identical(tolower(Sys.getenv("RAPIDGG_BROWSE", "true")), "false")) {
  message("Opening browser at ", url)
  try(utils::browseURL(url), silent = TRUE)
}
plumber::plumb(file.path(root, "inst", "plumber", "plumber.R"))$run(host = "127.0.0.1", port = 8787)
