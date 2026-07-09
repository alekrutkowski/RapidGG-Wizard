#' App directory for RapidGG Wizard
#'
#' Returns the directory that contains the static browser application.
#'
#' @return A character scalar path.
#' @export
rapidggwizard_app_dir <- function() {
  system.file("app", package = "rapidggwizard", mustWork = TRUE)
}

#' Plumber file for RapidGG Wizard
#'
#' Returns the Plumber API file used by the local R backend.
#'
#' @return A character scalar path.
#' @export
rapidggwizard_plumber_file <- function() {
  system.file("plumber", "plumber.R", package = "rapidggwizard", mustWork = TRUE)
}

#' Start RapidGG Wizard
#'
#' Starts a local Plumber server that serves the browser app and provides the
#' local R rendering backend.
#'
#' @param host Host interface. Defaults to `127.0.0.1`.
#' @param port Port number. Defaults to `8787`.
#' @param browse Open the app in the default browser.
#' @param app_dir Static app directory. Advanced users can point this at a
#'   modified copy of the app.
#' @return The running Plumber server, invisibly.
#' @export
run_app <- function(host = "127.0.0.1", port = 8787, browse = TRUE, app_dir = rapidggwizard_app_dir()) {
  if (!requireNamespace("plumber", quietly = TRUE)) {
    stop("Package 'plumber' is required. Install it with install.packages('plumber').", call. = FALSE)
  }

  app_dir <- normalizePath(app_dir, winslash = "/", mustWork = TRUE)
  Sys.setenv(RAPIDGG_APP_DIR = app_dir)

  pr <- plumber::plumb(rapidggwizard_plumber_file())
  url <- sprintf("http://%s:%s", host, as.integer(port))
  message("RapidGG Wizard listening at ", url)
  if (isTRUE(browse)) utils::browseURL(url)
  pr$run(host = host, port = as.integer(port))
}

#' Alias for run_app()
#'
#' @inheritParams run_app
#' @export
serve_app <- function(host = "127.0.0.1", port = 8787, browse = TRUE, app_dir = rapidggwizard_app_dir()) {
  run_app(host = host, port = port, browse = browse, app_dir = app_dir)
}
