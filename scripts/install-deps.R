pkgs <- c(
  "plumber", "jsonlite", "base64enc", "ggplot2", "scales", "ggrepel",
  "ggtext", "latex2exp", "ggthemes", "ggridges", "ggbeeswarm", "hexbin",
  "MASS", "svglite", "ragg", "devEMF", "systemfonts", "showtext", "sysfonts", "remotes"
)
missing <- pkgs[!vapply(pkgs, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing)) install.packages(missing)
