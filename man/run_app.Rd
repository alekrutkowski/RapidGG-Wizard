\name{run_app}
\alias{run_app}
\alias{serve_app}
\title{Start RapidGG Wizard}
\usage{
run_app(host = "127.0.0.1", port = 8787, browse = TRUE,
  app_dir = rapidggwizard_app_dir())
serve_app(host = "127.0.0.1", port = 8787, browse = TRUE,
  app_dir = rapidggwizard_app_dir())
}
\arguments{
\item{host}{Host interface. Defaults to \code{"127.0.0.1"}.}
\item{port}{Port number. Defaults to \code{8787}.}
\item{browse}{Open the app in the default browser.}
\item{app_dir}{Static app directory. Advanced users can point this at a modified copy of the app.}
}
\description{
Starts a local Plumber server that serves the RapidGG Wizard browser app and provides the local R rendering backend.
}
\value{
The running Plumber server, invisibly.
}
