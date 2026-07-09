
(function () {
  "use strict";

  const STORAGE_KEY = "rapidggwizard-state";
  const THEME_KEY = "rapidgg-wizard-interface-theme";
  const WEBR_CDN = "https://webr.r-wasm.org/latest/webr.mjs";
  const UTIF_CDN = "https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.js";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const RENDER_DEBOUNCE_MS = 2000;

  const sampleCsv = `model,mpg,cyl,disp,hp,wt,am,gear,carb
Mazda RX4,21.0,6,160.0,110,2.620,manual,4,4
Mazda RX4 Wag,21.0,6,160.0,110,2.875,manual,4,4
Datsun 710,22.8,4,108.0,93,2.320,manual,4,1
Hornet 4 Drive,21.4,6,258.0,110,3.215,automatic,3,1
Hornet Sportabout,18.7,8,360.0,175,3.440,automatic,3,2
Valiant,18.1,6,225.0,105,3.460,automatic,3,1
Duster 360,14.3,8,360.0,245,3.570,automatic,3,4
Merc 240D,24.4,4,146.7,62,3.190,automatic,4,2
Merc 230,22.8,4,140.8,95,3.150,automatic,4,2
Merc 280,19.2,6,167.6,123,3.440,automatic,4,4
Merc 280C,17.8,6,167.6,123,3.440,automatic,4,4
Merc 450SE,16.4,8,275.8,180,4.070,automatic,3,3
Merc 450SL,17.3,8,275.8,180,3.730,automatic,3,3
Merc 450SLC,15.2,8,275.8,180,3.780,automatic,3,3
Cadillac Fleetwood,10.4,8,472.0,205,5.250,automatic,3,4
Lincoln Continental,10.4,8,460.0,215,5.424,automatic,3,4
Chrysler Imperial,14.7,8,440.0,230,5.345,automatic,3,4
Fiat 128,32.4,4,78.7,66,2.200,manual,4,1
Honda Civic,30.4,4,75.7,52,1.615,manual,4,2
Toyota Corolla,33.9,4,71.1,65,1.835,manual,4,1
Toyota Corona,21.5,4,120.1,97,2.465,automatic,3,1
Dodge Challenger,15.5,8,318.0,150,3.520,automatic,3,2
AMC Javelin,15.2,8,304.0,150,3.435,automatic,3,2
Camaro Z28,13.3,8,350.0,245,3.840,automatic,3,4
Pontiac Firebird,19.2,8,400.0,175,3.845,automatic,3,2
Fiat X1-9,27.3,4,79.0,66,1.935,manual,4,1
Porsche 914-2,26.0,4,120.3,91,2.140,manual,5,2
Lotus Europa,30.4,4,95.1,113,1.513,manual,5,2
Ford Pantera L,15.8,8,351.0,264,3.170,manual,5,4
Ferrari Dino,19.7,6,145.0,175,2.770,manual,5,6
Maserati Bora,15.0,8,301.0,335,3.570,manual,5,8
Volvo 142E,21.4,4,121.0,109,2.780,manual,4,2`;

  const commonFonts = [
    "sans", "serif", "mono", "Arial", "Arial Narrow", "Calibri", "Cambria", "Candara", "Consolas", "Constantia", "Corbel", "Georgia", "Segoe UI", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana",
    "Aptos", "Aptos Display", "Cascadia Code", "Cascadia Mono", "Courier New", "Franklin Gothic Medium", "Garamond", "Gill Sans", "Lucida Console", "Palatino Linotype",
    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Nunito", "Raleway", "Merriweather", "Playfair Display", "Source Sans 3", "Source Serif 4", "Source Code Pro",
    "IBM Plex Sans", "IBM Plex Serif", "IBM Plex Mono", "Noto Sans", "Noto Serif", "Noto Sans Mono", "Noto Sans Display", "Noto Serif Display", "Noto Color Emoji",
    "Libre Franklin", "PT Sans", "PT Serif", "Work Sans", "Fira Sans", "Fira Code", "Ubuntu", "Ubuntu Mono", "Lora", "Crimson Pro", "DM Sans", "Manrope", "Rubik", "Mulish",
    "Liberation Sans", "Liberation Serif", "Liberation Mono", "DejaVu Sans", "DejaVu Serif", "DejaVu Sans Mono"
  ];

  const webFontFamilies = new Set([
    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Nunito", "Raleway", "Merriweather", "Playfair Display", "Source Sans 3", "Source Serif 4", "Source Code Pro",
    "IBM Plex Sans", "IBM Plex Serif", "IBM Plex Mono", "Noto Sans", "Noto Serif", "Noto Sans Mono", "Noto Sans Display", "Noto Serif Display", "Libre Franklin", "PT Sans", "PT Serif",
    "Work Sans", "Fira Sans", "Fira Code", "Ubuntu", "Ubuntu Mono", "Lora", "Crimson Pro", "DM Sans", "Manrope", "Rubik", "Mulish"
  ]);
  const loadedWebFonts = new Set();

  const googleFonts = [
    "ABeeZee", "Abel", "Abril Fatface", "Alegreya", "Alegreya Sans", "Archivo", "Archivo Narrow", "Arimo", "Assistant", "Barlow", "Barlow Condensed", "Bitter", "Cabin", "Cardo", "Catamaran", "Caveat", "Chivo", "Cormorant Garamond", "Crimson Pro", "DM Sans", "DM Serif Display", "Domine", "EB Garamond", "Exo 2", "Figtree", "Fira Code", "Fira Sans", "Fraunces", "Heebo", "IBM Plex Mono", "IBM Plex Sans", "IBM Plex Serif", "Inconsolata", "Inter", "Josefin Sans", "Karla", "Lato", "Libre Baskerville", "Libre Franklin", "Lora", "Manrope", "Merriweather", "Montserrat", "Mulish", "Nanum Gothic", "Newsreader", "Noto Sans", "Noto Sans Display", "Noto Sans Mono", "Noto Serif", "Noto Serif Display", "Nunito", "Nunito Sans", "Open Sans", "Oswald", "Overpass", "Oxygen", "PT Sans", "PT Serif", "Playfair Display", "Poppins", "Public Sans", "Quattrocento", "Quattrocento Sans", "Raleway", "Roboto", "Roboto Condensed", "Roboto Mono", "Roboto Serif", "Roboto Slab", "Rubik", "Signika", "Source Code Pro", "Source Sans 3", "Source Serif 4", "Space Grotesk", "Spectral", "Titillium Web", "Ubuntu", "Ubuntu Mono", "Work Sans", "Yanone Kaffeesatz", "Zilla Slab"
  ];
  googleFonts.forEach(f => webFontFamilies.add(f));

  const palettes = [
    { id: "okabe_ito", label: "Okabe-Ito", colors: ["#0072B2", "#E69F00", "#009E73", "#D55E00", "#CC79A7", "#56B4E9", "#F0E442", "#000000"] },
    { id: "tol_bright", label: "Tol Bright", colors: ["#4477AA", "#EE6677", "#228833", "#CCBB44", "#66CCEE", "#AA3377", "#BBBBBB"] },
    { id: "tol_muted", label: "Tol Muted", colors: ["#332288", "#88CCEE", "#44AA99", "#117733", "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499", "#DDDDDD"] },
    { id: "tol_vibrant", label: "Tol Vibrant", colors: ["#EE7733", "#0077BB", "#33BBEE", "#EE3377", "#CC3311", "#009988", "#BBBBBB"] },
    { id: "tableau10", label: "Tableau 10", colors: ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F", "#EDC948", "#B07AA1", "#FF9DA7", "#9C755F", "#BAB0AC"] },
    { id: "tableau20", label: "Tableau 20", colors: ["#4E79A7", "#A0CBE8", "#F28E2B", "#FFBE7D", "#59A14F", "#8CD17D", "#B6992D", "#F1CE63", "#499894", "#86BCB6", "#E15759", "#FF9D9A", "#79706E", "#BAB0AC", "#D37295", "#FABFD2", "#B07AA1", "#D4A6C8", "#9D7660", "#D7B5A6"] },
    { id: "brewer_set1", label: "Brewer Set1", colors: ["#E41A1C", "#377EB8", "#4DAF4A", "#984EA3", "#FF7F00", "#FFFF33", "#A65628", "#F781BF", "#999999"] },
    { id: "brewer_set2", label: "Brewer Set2", colors: ["#66C2A5", "#FC8D62", "#8DA0CB", "#E78AC3", "#A6D854", "#FFD92F", "#E5C494", "#B3B3B3"] },
    { id: "brewer_dark2", label: "Brewer Dark2", colors: ["#1B9E77", "#D95F02", "#7570B3", "#E7298A", "#66A61E", "#E6AB02", "#A6761D", "#666666"] },
    { id: "paired", label: "Paired", colors: ["#A6CEE3", "#1F78B4", "#B2DF8A", "#33A02C", "#FB9A99", "#E31A1C", "#FDBF6F", "#FF7F00", "#CAB2D6", "#6A3D9A", "#FFFF99", "#B15928"] },
    { id: "viridis", label: "Viridis", colors: ["#440154", "#31688E", "#35B779", "#FDE725"] },
    { id: "cividis", label: "Cividis", colors: ["#00204C", "#575D6D", "#A59C74", "#FFEA46"] },
    { id: "plasma", label: "Plasma", colors: ["#0D0887", "#9C179E", "#ED7953", "#F0F921"] },
    { id: "magma", label: "Magma", colors: ["#000004", "#3B0F70", "#8C2981", "#DE4968", "#FE9F6D", "#FCFDBF"] },
    { id: "inferno", label: "Inferno", colors: ["#000004", "#420A68", "#932667", "#DD513A", "#FCA50A", "#FCFFA4"] },
    { id: "turbo", label: "Turbo", colors: ["#30123B", "#4662D7", "#37A7E8", "#1AE4B6", "#72FE5E", "#C7EF34", "#FABA39", "#F66A1A", "#BC1E23", "#7A0403"] },
    { id: "spectral", label: "Spectral", colors: ["#9E0142", "#D53E4F", "#F46D43", "#FDAE61", "#FEE08B", "#E6F598", "#ABDDA4", "#66C2A5", "#3288BD", "#5E4FA2"] },
    { id: "rdbu", label: "RdBu", colors: ["#B2182B", "#D6604D", "#F4A582", "#FDDBC7", "#F7F7F7", "#D1E5F0", "#92C5DE", "#4393C3", "#2166AC"] },
    { id: "ylgnbu", label: "YlGnBu", colors: ["#FFFFD9", "#EDF8B1", "#C7E9B4", "#7FCDBB", "#41B6C4", "#1D91C0", "#225EA8", "#0C2C84"] },
    { id: "ylorbr", label: "YlOrBr", colors: ["#FFFFE5", "#FFF7BC", "#FEE391", "#FEC44F", "#FE9929", "#EC7014", "#CC4C02", "#8C2D04"] },
    { id: "pubu", label: "PuBu", colors: ["#FFF7FB", "#ECE7F2", "#D0D1E6", "#A6BDDB", "#74A9CF", "#3690C0", "#0570B0", "#034E7B"] },
    { id: "greens", label: "Greens", colors: ["#F7FCF5", "#E5F5E0", "#C7E9C0", "#A1D99B", "#74C476", "#41AB5D", "#238B45", "#005A32"] },
    { id: "blues", label: "Blues", colors: ["#F7FBFF", "#DEEBF7", "#C6DBEF", "#9ECAE1", "#6BAED6", "#4292C6", "#2171B5", "#084594"] },
    { id: "purples", label: "Purples", colors: ["#FCFBFD", "#EFEDF5", "#DADAEB", "#BCBDDC", "#9E9AC8", "#807DBA", "#6A51A3", "#4A1486"] },
    { id: "oranges", label: "Oranges", colors: ["#FFF5EB", "#FEE6CE", "#FDD0A2", "#FDAE6B", "#FD8D3C", "#F16913", "#D94801", "#8C2D04"] },
    { id: "redpurple", label: "Red Purple", colors: ["#FFF7F3", "#FDE0DD", "#FCC5C0", "#FA9FB5", "#F768A1", "#DD3497", "#AE017E", "#7A0177"] },
    { id: "earth", label: "Earth", colors: ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51", "#8AB17D", "#B56576", "#6D597A"] },
    { id: "sunset", label: "Sunset", colors: ["#2E1A47", "#5E2A84", "#B33F62", "#F2695C", "#FFB347", "#FFE156"] },
    { id: "ocean", label: "Ocean", colors: ["#012A4A", "#013A63", "#01497C", "#2A6F97", "#2C7DA0", "#61A5C2", "#A9D6E5"] },
    { id: "grey", label: "Grey", colors: ["#111827", "#4B5563", "#9CA3AF", "#E5E7EB"] },
    { id: "custom", label: "Custom", colors: ["#2563EB", "#DC2626", "#16A34A", "#F59E0B", "#7C3AED"] },
    { id: "none", label: "None", colors: ["#94a3b8", "#cbd5e1"] }
  ];

  const mappingSlots = [
    ["x", "X", "Horizontal position. Usually a numeric, date, or categorical variable."],
    ["y", "Y", "Vertical position. Bars can omit Y to count rows."],
    ["ymin", "Y min", "Lower interval for ribbons, error bars, ranges, and uncertainty."],
    ["ymax", "Y max", "Upper interval for ribbons, error bars, ranges, and uncertainty."],
    ["xend", "X end", "End point for segments, arrows, and slope-style displays."],
    ["yend", "Y end", "End point for segments, arrows, and slope-style displays."],
    ["color", "Colour", "Maps line, point, or text colour to a column."],
    ["fill", "Fill", "Maps filled geoms such as bars, tiles, violins, and boxes."],
    ["size", "Size", "Maps point, line, or text size to a column."],
    ["alpha", "Alpha", "Maps transparency to a column. Often best left unmapped."],
    ["shape", "Shape", "Maps point shape. Best for low-cardinality categorical columns."],
    ["z", "Z", "Surface height for contour and filled contour layers."],
    ["label", "Label", "Used by text, label, ggrepel, and rich text layers."],
    ["group", "Group", "Groups observations for lines, smooths, areas, and dodged summaries."],
    ["facetRow", "Facet row", "Rows in facet_grid()."],
    ["facetCol", "Facet col", "Columns in facet_grid()."]
  ];

  function emptyMappings() {
    return Object.fromEntries(mappingSlots.map(([key]) => [key, ""]));
  }

  const geomCatalog = [
    ["point", "Points"], ["line", "Lines"], ["step", "Steps"], ["col", "Columns"], ["bar", "Bars, count"],
    ["histogram", "Histogram"], ["density", "Density"], ["boxplot", "Boxplot"], ["violin", "Violin"], ["jitter", "Jitter"],
    ["smooth", "Smooth"], ["area", "Area"], ["ribbon", "Ribbon"], ["tile", "Tile"], ["bin2d", "2D bins"], ["hex", "Hex bins"],
    ["contour", "Contours"], ["contour_filled", "Filled contours"], ["rug", "Rug"], ["dotplot", "Dotplot"], ["text", "Text"], ["label", "Label"],
    ["text_repel", "Repelled text"], ["label_repel", "Repelled label"], ["errorbar", "Error bar"], ["pointrange", "Point range"],
    ["crossbar", "Crossbar"], ["segment", "Segment"], ["curve", "Curve"], ["richtext", "Rich text"], ["ridgeline", "Ridgeline"], ["quasirandom", "Quasirandom"]
  ];

  const geomDocs = {
    point: ["geom_point()", "https://ggplot2.tidyverse.org/reference/geom_point.html"],
    line: ["geom_line()", "https://ggplot2.tidyverse.org/reference/geom_path.html"],
    step: ["geom_step()", "https://ggplot2.tidyverse.org/reference/geom_path.html"],
    col: ["geom_col()", "https://ggplot2.tidyverse.org/reference/geom_bar.html"],
    bar: ["geom_bar()", "https://ggplot2.tidyverse.org/reference/geom_bar.html"],
    histogram: ["geom_histogram()", "https://ggplot2.tidyverse.org/reference/geom_histogram.html"],
    density: ["geom_density()", "https://ggplot2.tidyverse.org/reference/geom_density.html"],
    boxplot: ["geom_boxplot()", "https://ggplot2.tidyverse.org/reference/geom_boxplot.html"],
    violin: ["geom_violin()", "https://ggplot2.tidyverse.org/reference/geom_violin.html"],
    jitter: ["geom_jitter()", "https://ggplot2.tidyverse.org/reference/geom_jitter.html"],
    smooth: ["geom_smooth()", "https://ggplot2.tidyverse.org/reference/geom_smooth.html"],
    area: ["geom_area()", "https://ggplot2.tidyverse.org/reference/geom_ribbon.html"],
    ribbon: ["geom_ribbon()", "https://ggplot2.tidyverse.org/reference/geom_ribbon.html"],
    tile: ["geom_tile()", "https://ggplot2.tidyverse.org/reference/geom_tile.html"],
    bin2d: ["geom_bin_2d()", "https://ggplot2.tidyverse.org/reference/geom_bin_2d.html"],
    hex: ["geom_hex()", "https://ggplot2.tidyverse.org/reference/geom_hex.html"],
    contour: ["geom_density_2d()", "https://ggplot2.tidyverse.org/reference/geom_density_2d.html"],
    contour_filled: ["geom_contour_filled()", "https://ggplot2.tidyverse.org/reference/geom_contour.html"],
    rug: ["geom_rug()", "https://ggplot2.tidyverse.org/reference/geom_rug.html"],
    dotplot: ["geom_dotplot()", "https://ggplot2.tidyverse.org/reference/geom_dotplot.html"],
    text: ["geom_text()", "https://ggplot2.tidyverse.org/reference/geom_text.html"],
    label: ["geom_label()", "https://ggplot2.tidyverse.org/reference/geom_text.html"],
    text_repel: ["ggrepel::geom_text_repel()", "https://ggrepel.slowkow.com/reference/geom_text_repel.html"],
    label_repel: ["ggrepel::geom_label_repel()", "https://ggrepel.slowkow.com/reference/geom_text_repel.html"],
    errorbar: ["geom_errorbar()", "https://ggplot2.tidyverse.org/reference/geom_linerange.html"],
    pointrange: ["geom_pointrange()", "https://ggplot2.tidyverse.org/reference/geom_linerange.html"],
    crossbar: ["geom_crossbar()", "https://ggplot2.tidyverse.org/reference/geom_linerange.html"],
    segment: ["geom_segment()", "https://ggplot2.tidyverse.org/reference/geom_segment.html"],
    curve: ["geom_curve()", "https://ggplot2.tidyverse.org/reference/geom_segment.html"],
    richtext: ["ggtext::geom_richtext()", "https://wilkelab.org/ggtext/reference/geom_richtext.html"],
    ridgeline: ["ggridges::geom_density_ridges()", "https://wilkelab.org/ggridges/reference/geom_density_ridges.html"],
    quasirandom: ["ggbeeswarm::geom_quasirandom()", "https://eclarke.r-universe.dev/ggbeeswarm/doc/manual.html"]
  };

  const plotTypes = [
    { id: "scatter", title: "Scatter", desc: "Two numeric variables", geom: "scatter" },
    { id: "bubble", title: "Bubble", desc: "Scatter with size mapping", geom: "bubble" },
    { id: "scatter_smooth", title: "Scatter + smooth", desc: "Trend and points", geom: "smooth" },
    { id: "line", title: "Line", desc: "Ordered x and y", geom: "line" },
    { id: "step", title: "Step", desc: "Stair-step change", geom: "step" },
    { id: "area", title: "Area", desc: "Filled line" , geom: "area"},
    { id: "ribbon", title: "Ribbon", desc: "Band between limits", geom: "ribbon" },
    { id: "bar_count", title: "Count bar", desc: "Counts by category", geom: "bar" },
    { id: "column", title: "Column", desc: "Category by value", geom: "column" },
    { id: "stacked_bar", title: "Stacked bar", desc: "Composed categories", geom: "stacked" },
    { id: "filled_bar", title: "Filled bar", desc: "Percent composition", geom: "filled" },
    { id: "horizontal_bar", title: "Horizontal bar", desc: "Readable categories", geom: "hbar" },
    { id: "polar_bar", title: "Polar bar", desc: "Circular bar layout", geom: "polar" },
    { id: "histogram", title: "Histogram", desc: "Distribution bins", geom: "hist" },
    { id: "density", title: "Density", desc: "Smoothed distribution", geom: "density" },
    { id: "dotplot", title: "Dotplot", desc: "Stacked dots", geom: "dotplot" },
    { id: "boxplot", title: "Boxplot", desc: "Distribution by group", geom: "box" },
    { id: "violin", title: "Violin", desc: "Density by group", geom: "violin" },
    { id: "jitter", title: "Jitter", desc: "Raw points by group", geom: "jitter" },
    { id: "quasirandom", title: "Quasirandom", desc: "Beeswarm-like points", geom: "bee" },
    { id: "ridgeline", title: "Ridgeline", desc: "Stacked densities", geom: "ridge" },
    { id: "heatmap", title: "Heatmap", desc: "Tiles with fill", geom: "tile" },
    { id: "bin2d", title: "2D bin", desc: "Dense scatter counts", geom: "bin2d" },
    { id: "hex", title: "Hexbin", desc: "Hexagonal counts", geom: "hex" },
    { id: "contour", title: "Contour", desc: "Density contour lines", geom: "contour" },
    { id: "contour_filled", title: "Filled contour", desc: "Filled surface bands", geom: "contourfilled" },
    { id: "rug", title: "Rug", desc: "Marginal ticks", geom: "rug" },
    { id: "text", title: "Text labels", desc: "Label observations", geom: "text" },
    { id: "label", title: "Boxed labels", desc: "Text with background", geom: "label" },
    { id: "repel_text", title: "ggrepel text", desc: "Non-overlapping labels", geom: "repel" },
    { id: "rich_text", title: "Rich text", desc: "Markdown or HTML labels", geom: "rich" },
    { id: "errorbar", title: "Error bars", desc: "Intervals around values", geom: "error" },
    { id: "pointrange", title: "Point range", desc: "Point plus interval", geom: "range" },
    { id: "lollipop", title: "Lollipop", desc: "Segment plus point", geom: "lollipop" },
    { id: "segment", title: "Segment", desc: "Start and end points", geom: "segment" },
    { id: "facet_scatter", title: "Small multiples", desc: "Faceted scatter", geom: "facet" },
    { id: "small_multiple_line", title: "Faceted line", desc: "Line panels", geom: "facetline" }
  ];

  const mimeForFormat = {
    svg: "image/svg+xml",
    png: "image/png",
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    tiff: "image/tiff",
    emf: "image/x-emf"
  };

  const app = document.getElementById("app");
  let state = loadInitialState();
  if (/^https?:/i.test(location.protocol) && isLocalHttpOrigin(location.origin) && !["5173", "4173"].includes(location.port)) {
    state.backend = "local";
    state.localUrl = location.origin.replace(/\/+$/, "");
  }
  normaliseFontForBackend();
  let dataset = parseCsv(state.csv || sampleCsv, state.dataName || "mtcars_demo");
  let resultUrl = "";
  let resultMime = "";
  let resultSvgText = "";
  let resultTiffPreviewUrl = "";
  let resultTiffPreviewError = "";
  let resultPreviewNote = "";
  let lastError = "";
  let isRendering = false;
  let statusMessage = "Ready.";
  let renderTimer = 0;
  let historyPast = [];
  let historyFuture = [];
  let lastUndoSnapshot = JSON.stringify(state);
  let activeTab = state.activeTab || "layers";
  let webRInstance = null;
  let utifLoadPromise = null;
  let webRInstalling = new Set();
  let webRInstalled = new Set();
  let knownFonts = initialFontList();

  applyInterfaceTheme(state.interfaceTheme || localStorage.getItem(THEME_KEY) || "light");

  function isLocalHttpOrigin(origin) {
    try {
      const url = new URL(origin || location.origin);
      return /^https?:$/.test(url.protocol) && ["127.0.0.1", "localhost", "::1"].includes(url.hostname);
    } catch (e) {
      return false;
    }
  }

  function localCandidateOrigin() {
    return /^https?:/i.test(location.protocol) ? location.origin : "http://127.0.0.1:8787";
  }

  function normaliseFontForBackend() {
    if (!state || !state.theme) return false;
    const fam = String(state.theme.baseFamily || "").trim();
    if (state.backend === "webr" && (!fam || fam === "sans" || fam === "serif" || fam === "mono")) {
      state.theme.baseFamily = fam === "serif" ? "Merriweather" : fam === "mono" ? "Roboto Mono" : "Inter";
      ensureWebFont(state.theme.baseFamily);
      return true;
    }
    return false;
  }

  function initialFontList() {
    if (typeof state !== "undefined" && state && state.backend === "local") {
      return dedupe(commonFonts.map(family => ({ family, source: "common" })));
    }
    return dedupe(googleFonts.map(family => ({ family, source: "Google Fonts" })));
  }

  async function fetchGoogleFontsCatalog() {
    const res = await fetch("https://fonts.google.com/metadata/fonts", { cache: "force-cache" });
    if (!res.ok) throw new Error(`Google Fonts metadata returned HTTP ${res.status}`);
    const text = (await res.text()).replace(/^\)\]\}'\s*/, "");
    const json = JSON.parse(text);
    const rows = json.familyMetadataList || json.items || json.families || [];
    return rows.map(x => x.family || x.name).filter(Boolean);
  }

  async function setWebRFontList(options) {
    const quiet = !options || options.quiet !== false;
    let families = googleFonts;
    try {
      const remote = await fetchGoogleFontsCatalog();
      if (remote.length > 100) families = remote;
    } catch (e) {
      if (!quiet) console.warn("Could not refresh Google Fonts metadata, using bundled list.", e);
    }
    families.forEach(f => webFontFamilies.add(f));
    knownFonts = dedupe([
      { family: "Inter", source: "Google Fonts" },
      { family: "Roboto", source: "Google Fonts" },
      { family: "Open Sans", source: "Google Fonts" },
      ...families.map(family => ({ family, source: "Google Fonts" }))
    ]);
    normaliseFontForBackend();
    ensureWebFont(state.theme.baseFamily || "Inter");
    saveState();
  }

  async function refreshFontsForBackend(options) {
    const quiet = !options || options.quiet !== false;
    if (state.backend === "local") {
      await loadLocalFonts({ quiet });
    } else {
      await setWebRFontList({ quiet });
      if (!quiet) toast("Google Fonts list loaded for WebR.");
      renderApp();
    }
  }

  function defaultState() {
    const localOrigin = localCandidateOrigin();
    const likelyLocal = isLocalHttpOrigin(localOrigin) && !["5173", "4173"].includes(new URL(localOrigin).port);
    return {
      version: 13,
      interfaceTheme: localStorage.getItem(THEME_KEY) || "light",
      wizardStarted: false,
      plotType: "scatter",
      backend: likelyLocal ? "local" : "webr",
      localUrl: localOrigin,
      autoRender: true,
      dataName: "mtcars_demo",
      csv: sampleCsv,
      mappings: { x: "wt", y: "mpg", color: "am", label: "model" },
      layers: [makeLayer("point")],
      labels: {
        title: "Fuel economy and vehicle weight",
        subtitle: "Demo chart generated from an embedded mtcars-like CSV",
        caption: "RapidGG Wizard",
        xTitle: "Weight",
        yTitle: "Miles per gallon",
        colorTitle: "Transmission",
        fillTitle: "",
        sizeTitle: "",
        alphaTitle: "",
        shapeTitle: "",
        titleMode: "plain",
        subtitleMode: "plain",
        captionMode: "plain",
        axisMode: "plain",
        legendMode: "plain",
        titleAlign: "left",
        subtitleAlign: "left",
        captionAlign: "left",
        titleArea: "plot",
        subtitleArea: "plot",
        captionArea: "plot"
      },
      theme: {
        preset: "rapid",
        presetOverride: false,
        baseFamily: likelyLocal ? "sans" : "Inter",
        baseSize: 12,
        titleSize: 18,
        subtitleSize: 11,
        captionSize: 9,
        axisTitleSize: 11,
        axisTextSize: 10,
        stripTextSize: 10,
        titleFace: "bold",
        subtitleFace: "plain",
        captionFace: "plain",
        axisTitleFace: "bold",
        axisTextFace: "plain",
        stripTextFace: "bold",
        textColor: "#111827",
        plotBackground: "#ffffff",
        panelBackground: "#ffffff",
        gridColor: "#e5e7eb",
        majorGrid: "line",
        minorGrid: "blank",
        panelBorder: "blank",
        removeAxisTitleX: false,
        removeAxisTitleY: false,
        removeAxisTextX: false,
        removeAxisTextY: false,
        removeTicks: false,
        removeStrips: false,
        plotMarginTopPt: 12,
        plotMarginRightPt: 16,
        plotMarginBottomPt: 12,
        plotMarginLeftPt: 16
      },
      palette: { color: "okabe_ito", fill: "okabe_ito", reverse: false, customColors: ["#2563EB", "#DC2626", "#16A34A", "#F59E0B", "#7C3AED"] },
      axis: {
        xAngle: 0,
        yAngle: 0,
        xMin: "",
        xMax: "",
        yMin: "",
        yMax: "",
        xTransform: "none",
        yTransform: "none",
        xLabel: "default",
        yLabel: "default",
        secondaryY: false,
        secondaryYName: "Secondary axis",
        secondaryYFactor: 1,
        secondaryYOffset: 0,
        flip: false,
        fixed: false,
        coordRatio: 1,
        polar: false,
        clip: "on",
        xTitlePosition: "center",
        yTitlePosition: "middle",
        xTitleMarginPt: 10,
        yTitleMarginPt: 20,
        xBreaks: "",
        yBreaks: ""
      },
      legend: {
        show: true,
        position: "right",
        inside: false,
        insideX: 0.98,
        insideY: 0.98,
        justification: "center",
        direction: "vertical",
        box: "vertical",
        titlePosition: "top",
        titleSize: 10,
        textSize: 9,
        titleFace: "bold",
        textFace: "plain",
        keySizePt: 11,
        keyWidthPt: "",
        keyHeightPt: "",
        spacingXPt: 4,
        spacingYPt: 4,
        nrow: "",
        ncol: "",
        reverse: false,
        byrow: false,
        background: "#ffffff",
        border: "",
        overrideSize: "",
        overrideAlpha: ""
      },
      facet: { mode: "none", wrapBy: "", ncol: 2, scales: "fixed" },
      annotations: [],
      export: {
        format: "svg",
        units: "cm",
        widthCm: 16,
        heightCm: 10,
        widthPx: 1200,
        heightPx: 750,
        lockAspect: true,
        aspectRatio: 1.6,
        dpi: 300,
        bg: "#ffffff"
      },
      advanced: {
        extraPackages: "",
        afterDataCode: "",
        beforePlotCode: "",
        extraLayersCode: "",
        scaleOverridesCode: "",
        themeOverridesCode: "",
        afterPlotCode: ""
      },
      fontSearch: "",
      settingsSearch: "",
      focusSetting: ""
    };
  }

  function makeLayer(geom) {
    return {
      id: uniqueId("layer"),
      geom: geom || "point",
      enabled: true,
      alpha: 0.9,
      size: geom && geom.includes("text") ? 3.3 : 2.4,
      linewidth: 0.6,
      bins: 30,
      binwidth: "",
      position: "identity",
      smoothMethod: "auto",
      smoothSe: true,
      color: "",
      fill: "",
      labelNudgeX: "",
      labelNudgeY: "",
      repelForce: 1,
      richTextMode: "markdown",
      customParams: ""
    };
  }

  function makeAnnotation(type) {
    return {
      id: uniqueId("ann"),
      type: type || "text",
      mode: "plain",
      label: "Annotation",
      x: "Inf",
      y: "Inf",
      xend: "",
      yend: "",
      xmin: "",
      xmax: "",
      ymin: "",
      ymax: "",
      color: "#111827",
      fill: "#ffffff",
      alpha: 0.95,
      size: 3.4,
      linewidth: 0.5
    };
  }

  function loadInitialState() {
    const base = defaultState();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return base;
      const parsed = JSON.parse(saved);
      const merged = mergeDeep(base, parsed);
      migrateState(merged, parsed);
      return merged;
    } catch (e) {
      console.warn("Could not load saved RapidGG state", e);
      return base;
    }
  }

  function migrateState(target, parsed) {
    const version = Number(parsed && parsed.version) || 0;
    if (!target.theme) target.theme = {};
    if (target.theme.presetOverride == null) target.theme.presetOverride = false;
    if (target.legend) {
      if (target.legend.keyWidthPt == null) target.legend.keyWidthPt = "";
      if (target.legend.keyHeightPt == null) target.legend.keyHeightPt = "";
      if (target.legend.reverse == null) target.legend.reverse = false;
      if (target.legend.byrow == null) target.legend.byrow = false;
      if (target.legend.border == null || version < 6) target.legend.border = "";
    }
    if (!target.mappings) target.mappings = emptyMappings();
    if (target.mappings.z == null) target.mappings.z = "";
    if (!target.labels) target.labels = {};
    if (target.labels.titleAlign == null) target.labels.titleAlign = "left";
    if (target.labels.subtitleAlign == null) target.labels.subtitleAlign = "left";
    if (target.labels.captionAlign == null) target.labels.captionAlign = "left";
    if (target.labels.subtitleArea == null) target.labels.subtitleArea = "plot";
    if (target.labels.titleArea == null) target.labels.titleArea = "plot";
    if (target.labels.captionArea == null) target.labels.captionArea = "plot";
    if (!target.axis) target.axis = {};
    if (target.axis.xTitlePosition == null) target.axis.xTitlePosition = "center";
    if (target.axis.yTitlePosition == null) target.axis.yTitlePosition = "middle";
    if (target.axis.xTitleMarginPt == null) target.axis.xTitleMarginPt = 10;
    if (target.axis.yTitleMarginPt == null || version < 11) target.axis.yTitleMarginPt = 20;
    if (target.axis.xBreaks == null) target.axis.xBreaks = "";
    if (target.axis.yBreaks == null) target.axis.yBreaks = "";
    if (target.theme.plotMarginTopPt == null) target.theme.plotMarginTopPt = 12;
    if (target.theme.plotMarginRightPt == null) target.theme.plotMarginRightPt = 16;
    if (target.theme.plotMarginBottomPt == null) target.theme.plotMarginBottomPt = 12;
    if (target.theme.plotMarginLeftPt == null) target.theme.plotMarginLeftPt = 16;
    if (!target.export) target.export = {};
    if (target.export.dpi == null) target.export.dpi = 300;
    if (!target.palette) target.palette = {};
    if (!Array.isArray(target.palette.customColors)) target.palette.customColors = ["#2563EB", "#DC2626", "#16A34A", "#F59E0B", "#7C3AED"];
  }

  async function detectLocalBackendOnStart() {
    if (!/^https?:/i.test(location.protocol)) return;
    try {
      const base = location.origin.replace(/\/+$/, "");
      const res = await fetch(`${base}/health`, { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json && json.ok && String(json.backend || "").toLowerCase().includes("local r")) {
        const changed = state.backend !== "local" || state.localUrl !== base;
        state.backend = "local";
        state.localUrl = base;
        if (changed) {
          saveState();
          await refreshFontsForBackend({ quiet: true });
          renderApp();
          if (state.wizardStarted && state.autoRender) scheduleRender();
        }
      }
    } catch (e) {
      // Not served by the local R backend. Keep the chosen backend unchanged.
    }
  }

  function mergeDeep(a, b) {
    if (!b || typeof b !== "object" || Array.isArray(b)) return b === undefined ? a : b;
    const out = Array.isArray(a) ? a.slice() : { ...a };
    Object.keys(b).forEach(k => {
      out[k] = b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) ? mergeDeep(a ? a[k] : undefined, b[k]) : b[k];
    });
    return out;
  }

  function saveState() {
    state.version = 14;
    state.activeTab = activeTab;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function resetAll() {
    const ok = window.confirm("Reset the whole wizard, including mappings, layers, settings, and the saved browser state?");
    if (!ok) return;
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    if (resultTiffPreviewUrl) URL.revokeObjectURL(resultTiffPreviewUrl);
    resultUrl = "";
    resultMime = "";
    resultSvgText = "";
    resultTiffPreviewUrl = "";
    resultTiffPreviewError = "";
    resultPreviewNote = "";
    lastError = "";
    state = defaultState();
    dataset = parseCsv(state.csv, state.dataName);
    activeTab = "layers";
    localStorage.removeItem(STORAGE_KEY);
    commitHistory();
    saveState();
    renderApp();
  }

  function applyInterfaceTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", next === "dark");
    state.interfaceTheme = next;
    localStorage.setItem(THEME_KEY, next);
  }

  function toggleTheme() {
    applyInterfaceTheme(state.interfaceTheme === "dark" ? "light" : "dark");
    saveState();
    renderApp();
  }

  function uniqueId(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  }

  function escapeHtml(x) {
    return String(x ?? "").replace(/[&<>\"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch]));
  }

  function rString(value) {
    return JSON.stringify(String(value ?? "")).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }

  function rName(value) {
    return "`" + String(value).replace(/`/g, "\\`") + "`";
  }

  function bool(value) {
    return value ? "TRUE" : "FALSE";
  }

  function num(value, fallback) {
    const x = Number(value);
    return Number.isFinite(x) ? x : fallback;
  }

  function maybeNumCode(value, fallback) {
    const s = String(value ?? "").trim();
    if (!s) return fallback;
    return s;
  }

  function textAlignHjust(value) {
    const map = { left: 0, center: 0.5, right: 1 };
    return Object.prototype.hasOwnProperty.call(map, value) ? map[value] : 0;
  }

  function xTitleHjust(value) {
    const map = { left: 0, center: 0.5, right: 1 };
    return Object.prototype.hasOwnProperty.call(map, value) ? map[value] : 0.5;
  }

  function yTitleHjust(value) {
    const map = { bottom: 0, middle: 0.5, top: 1 };
    return Object.prototype.hasOwnProperty.call(map, value) ? map[value] : 0.5;
  }

  function joinArgs(parts) {
    return parts.filter(x => x && String(x).trim()).join(", ");
  }

  function splitPackages(value) {
    return String(value || "").split(/[\s,;]+/).map(x => x.trim()).filter(Boolean);
  }

  function deepClone(x) {
    return JSON.parse(JSON.stringify(x));
  }

  function dedupe(fonts) {
    const seen = new Set();
    const out = [];
    fonts.forEach(f => {
      const family = asText(typeof f === "string" ? f : f && f.family).trim();
      if (!family) return;
      const key = family.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ family, source: asText(typeof f === "string" ? "common" : f && f.source) || "font" });
    });
    return out.sort((a, b) => a.family.localeCompare(b.family));
  }

  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function setPath(obj, path, value) {
    const keys = path.split(".");
    let target = obj;
    keys.slice(0, -1).forEach(k => {
      if (!target[k] || typeof target[k] !== "object") target[k] = {};
      target = target[k];
    });
    target[keys[keys.length - 1]] = value;
  }

  function parseCsv(text, name) {
    const rowsRaw = csvRows(text || "");
    if (!rowsRaw.length) return { name: name || "empty", rows: [], columns: [], csv: text || "" };
    const header = rowsRaw[0].map(x => x.trim());
    const rows = rowsRaw.slice(1).filter(r => r.some(cell => String(cell).trim() !== "")).map(r => {
      const obj = {};
      header.forEach((h, i) => { obj[h || `V${i + 1}`] = parseValue(r[i] ?? ""); });
      return obj;
    });
    const columns = header.map((h, i) => inferColumn(h || `V${i + 1}`, rows.map(r => r[h || `V${i + 1}`])));
    return { name: name || "data", rows, columns, csv: text || "" };
  }

  function csvRows(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];
      if (q) {
        if (ch === '"' && next === '"') { cell += '"'; i++; }
        else if (ch === '"') q = false;
        else cell += ch;
      } else {
        if (ch === '"') q = true;
        else if (ch === ",") { row.push(cell); cell = ""; }
        else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
        else if (ch !== "\r") cell += ch;
      }
    }
    row.push(cell);
    rows.push(row);
    return rows.filter(r => r.length > 1 || String(r[0]).trim() !== "");
  }

  function parseValue(x) {
    const s = String(x ?? "").trim();
    if (s === "") return null;
    if (/^(true|false)$/i.test(s)) return /^true$/i.test(s);
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s)) return Number(s);
    return s;
  }

  function inferColumn(name, values) {
    const present = values.filter(v => v !== null && v !== undefined && v !== "");
    const missing = values.length - present.length;
    const distinct = new Set(present.map(v => String(v))).size;
    let type = "unknown";
    if (present.length === 0) type = "unknown";
    else if (present.every(v => typeof v === "boolean")) type = "logical";
    else if (present.every(v => typeof v === "number" && Number.isInteger(v))) type = distinct <= 12 ? "integer" : "numeric";
    else if (present.every(v => typeof v === "number")) type = "numeric";
    else if (present.every(v => /^\d{4}-\d{2}-\d{2}$/.test(String(v)))) type = "date";
    else type = "categorical";
    return { name, type, missing, distinct };
  }

  function column(name) {
    return dataset.columns.find(c => c.name === name);
  }

  function numericColumns() {
    return dataset.columns.filter(c => c.type === "numeric" || (c.type === "integer" && c.distinct > 12));
  }

  function categoricalColumns() {
    return dataset.columns.filter(c => c.type === "categorical" || c.type === "logical" || c.distinct <= 12);
  }

  function lowCardinalityColumns(limit) {
    const max = limit || 12;
    return dataset.columns.filter(c => (c.type === "categorical" || c.type === "logical" || c.type === "integer") && c.distinct > 1 && c.distinct <= max);
  }

  function highCardinalityLabelColumns() {
    return dataset.columns.filter(c => c.type === "categorical" && c.distinct > 12);
  }

  function firstCol(cols, fallbackIndex) {
    return (cols && cols[0] && cols[0].name) || (dataset.columns[fallbackIndex || 0] && dataset.columns[fallbackIndex || 0].name) || "";
  }

  function guessMappings(plotId) {
    const nums = numericColumns();
    const cats = categoricalColumns();
    const lowCats = lowCardinalityColumns(12);
    const all = dataset.columns;
    const xNum = firstCol(nums, 1);
    const yNum = (nums[1] && nums[1].name) || xNum;
    const cat = (lowCats[0] && lowCats[0].name) || (cats.find(c => c.distinct > 1 && c.distinct <= 20) || {}).name || "";
    const cat2 = (lowCats.find(c => c.name !== cat) || cats.find(c => c.name !== cat && c.distinct > 1 && c.distinct <= 20) || {}).name || "";
    const label = (highCardinalityLabelColumns()[0] || all[0] || {}).name || "";
    const m = { x: xNum, y: yNum, color: cat || "", label };
    if (["bar_count", "stacked_bar", "filled_bar", "polar_bar", "horizontal_bar"].includes(plotId)) {
      m.x = cat || xNum; m.y = ""; m.fill = cat2 && cat2 !== m.x ? cat2 : ""; m.color = "";
    }
    if (["column", "boxplot", "violin", "jitter", "quasirandom", "errorbar", "pointrange", "lollipop"].includes(plotId)) {
      m.x = cat || xNum; m.y = xNum || yNum; m.color = cat2 && cat2 !== m.x ? cat2 : ""; m.fill = cat2 && cat2 !== m.x ? cat2 : "";
    }
    if (["histogram", "density", "dotplot", "ridgeline"].includes(plotId)) {
      m.x = xNum; m.y = plotId === "ridgeline" ? (cat || "") : ""; m.fill = cat || ""; m.color = cat || "";
    }
    if (["heatmap"].includes(plotId)) {
      m.x = cat || firstCol(all, 0); m.y = cat2 || firstCol(all, 1); m.fill = xNum || yNum; m.color = "";
    }
    if (["bin2d", "hex", "contour"].includes(plotId)) {
      m.x = xNum; m.y = yNum; m.color = ""; m.fill = "";
    }
    if (["contour_filled"].includes(plotId)) {
      m.x = xNum; m.y = yNum; m.z = (nums[2] && nums[2].name) || yNum; m.color = ""; m.fill = "";
    }
    if (["bubble"].includes(plotId)) {
      m.size = (nums[2] && nums[2].name) || "";
    }
    if (["facet_scatter", "small_multiple_line"].includes(plotId)) {
      m.x = xNum; m.y = yNum; m.facetCol = cat || ""; m.color = cat || "";
    }
    if (["segment"].includes(plotId)) {
      m.x = xNum; m.y = yNum; m.xend = (nums[2] && nums[2].name) || xNum; m.yend = (nums[3] && nums[3].name) || yNum;
    }
    return m;
  }

  function layersForPlot(plotId) {
    const layer = g => makeLayer(g);
    const pos = (g, p) => { const l = layer(g); l.position = p; return l; };
    switch (plotId) {
      case "scatter": return [layer("point")];
      case "bubble": return [layer("point")];
      case "scatter_smooth": return [layer("point"), layer("smooth")];
      case "line": return [layer("line")];
      case "step": return [layer("step")];
      case "area": return [layer("area")];
      case "ribbon": return [layer("ribbon"), layer("line")];
      case "bar_count": return [layer("bar")];
      case "column": return [layer("col")];
      case "stacked_bar": return [pos("bar", "stack")];
      case "filled_bar": return [pos("bar", "fill")];
      case "horizontal_bar": return [layer("bar")];
      case "polar_bar": return [layer("bar")];
      case "histogram": return [layer("histogram")];
      case "density": return [layer("density")];
      case "dotplot": return [layer("dotplot")];
      case "boxplot": return [layer("boxplot")];
      case "violin": return [layer("violin")];
      case "jitter": return [layer("jitter")];
      case "quasirandom": return [layer("quasirandom")];
      case "ridgeline": return [layer("ridgeline")];
      case "heatmap": return [layer("tile")];
      case "bin2d": return [layer("bin2d")];
      case "hex": return [layer("hex")];
      case "contour": return [layer("contour")];
      case "contour_filled": return [layer("contour_filled")];
      case "rug": return [layer("point"), layer("rug")];
      case "text": return [layer("point"), layer("text")];
      case "label": return [layer("point"), layer("label")];
      case "repel_text": return [layer("point"), layer("text_repel")];
      case "rich_text": return [layer("point"), layer("richtext")];
      case "errorbar": return [layer("errorbar"), layer("point")];
      case "pointrange": return [layer("pointrange")];
      case "lollipop": return [layer("segment"), layer("point")];
      case "segment": return [layer("segment")];
      case "facet_scatter": return [layer("point")];
      case "small_multiple_line": return [layer("line")];
      default: return [layer("point")];
    }
  }

  function choosePlotType(plotId) {
    state.plotType = plotId;
    state.wizardStarted = true;
    state.mappings = { ...emptyMappings(), ...guessMappings(plotId) };
    state.layers = layersForPlot(plotId);
    state.axis.flip = plotId === "horizontal_bar";
    state.axis.polar = plotId === "polar_bar";
    const isFacet = plotId === "facet_scatter" || plotId === "small_multiple_line";
    state.facet.mode = isFacet ? "grid" : "none";
    if (isFacet) state.facet.scales = "fixed";
    state.labels.title = plotTypes.find(p => p.id === plotId)?.title || state.labels.title;
    state.labels.xTitle = state.mappings.x || "";
    state.labels.yTitle = state.mappings.y || "";
    state.labels.colorTitle = state.mappings.color || "";
    state.labels.fillTitle = state.mappings.fill || "";
    state.labels.sizeTitle = state.mappings.size || "";
    commitHistory();
    saveState();
    renderApp();
    scheduleRender();
  }

  function renderApp() {
    dataset = parseCsv(state.csv || sampleCsv, state.dataName || "data");
    if (!state.wizardStarted) {
      renderStarter();
    } else {
      renderBuilder();
    }
    updateCodePreview();
    bindEvents();
    loadVisibleWebFonts();
  }

  function topbarHtml() {
    return `
      <header class="topbar">
        <div class="brand">
          <div class="logo">gg</div>
          <div>
            <h1>RapidGG Wizard</h1>
            <p>Point, click, drag, render, export exact ggplot2 code and state.</p>
          </div>
        </div>
        <div class="toolbar">
          <button class="btn small" id="undoBtn" title="Undo plot change (Ctrl+Z)" ${historyPast.length ? "" : "disabled"}>↶ Undo</button>
          <button class="btn small" id="redoBtn" title="Redo plot change (Ctrl+Y)" ${historyFuture.length ? "" : "disabled"}>Redo ↷</button>
          <button class="btn small" id="importMagic" title="Paste a RapidGG magic state string from generated R code.">Paste magic</button>
          ${isRendering ? `<span class="pill busy-pill"><span class="mini-spinner"></span>Rendering</span>` : ""}
          <select class="select" style="width:118px" data-bind="backend" data-refresh="true" title="Choose WebR in the browser or local R through the built-in Plumber server.">
            ${option("webr", "WebR", state.backend)}
            ${option("local", "Local R", state.backend)}
          </select>
          ${state.backend === "local" ? `<input class="input" style="width:220px" data-bind="localUrl" value="${escapeHtml(state.localUrl)}" title="Local R backend URL." />` : ""}
          <label class="toggle-row" title="Render again automatically when chart settings change.">
            <span class="label">Auto render</span>
            ${switchHtml("autoRender", state.autoRender)}
          </label>
          <button class="icon-btn" id="themeToggle" title="Toggle light or dark interface">${state.interfaceTheme === "dark" ? "☀" : "☾"}</button>
          <button class="btn danger" id="resetAll" title="Reset all settings and clear the saved browser state.">Reset all</button>
        </div>
      </header>`;
  }

  function renderStarter() {
    const saved = localStorage.getItem(STORAGE_KEY);
    app.innerHTML = `
      <div class="app-shell">
        ${topbarHtml()}
        <main class="plot-gallery panel starter-hero">
          <div class="starter-head">
            <div>
              <span class="pill ok">Visual start</span>
              <h2>Choose the first plot shape</h2>
              <p>Select a graphical card, then refine data mappings, layers, text, axes, legends, facets, annotations, and export settings. The wizard auto-saves in this browser.</p>
            </div>
            <div class="toolbar">
              ${saved ? `<button class="btn" id="continueSaved">Continue saved wizard</button>` : ""}
              <button class="btn" id="importJsonStarter" title="Open a saved RapidGG JSON state file.">Open JSON state</button>
              <button class="btn" id="importMagicStarter" title="Paste a RapidGG magic state string from generated R code.">Paste magic state</button>
              <label class="btn" title="Upload a CSV before choosing a plot type.">Upload CSV<input class="file-input" type="file" id="starterCsv" accept=".csv,text/csv"></label>
            </div>
          </div>
          <div class="card card-pad" style="margin-bottom:14px">
            <div class="section-title">
              <div><h3>Current data</h3><p>${escapeHtml(dataset.name)}: ${dataset.rows.length} rows, ${dataset.columns.length} columns. Upload a CSV now or choose a plot with the demo data.</p></div>
              <button class="btn small" id="guessStarter">Refresh column guesses</button>
            </div>
            <div class="columns-list" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr));display:grid">
              ${dataset.columns.slice(0, 12).map(c => `<div class="column-pill"><span class="column-name">${escapeHtml(c.name)}</span><span class="column-type">${c.type}</span></div>`).join("")}
            </div>
          </div>
          <div class="gallery-grid">
            ${plotTypes.map(cardPlotType).join("")}
          </div>
        </main>
        <input type="file" id="importJsonFile" class="file-input" accept=".json,application/json,text/json,text/plain">
      </div>`;
  }

  function cardPlotType(p) {
    const use = plotUseText(p.id);
    const title = `Start with ${p.title}\n\n${use}`;
    return `<button class="plot-card" data-plot-type="${p.id}" title="${escapeHtml(title)}">
      ${thumbSvg(p.geom)}
      <strong>${escapeHtml(p.title)}</strong>
      <span>${escapeHtml(p.desc)}</span>
      <em>${escapeHtml(use)}</em>
    </button>`;
  }

  function plotUseText(id) {
    const uses = {
      scatter: "Best for showing association, outliers, and non-linear structure between two numeric variables.",
      bubble: "Best when two numeric positions need a third numeric magnitude without adding a separate panel.",
      scatter_smooth: "Use when the main question is the direction or shape of a trend through noisy points.",
      line: "Best for ordered observations such as time series, dose curves, or trajectories.",
      step: "Best for values that change at thresholds, periods, or discrete event times.",
      area: "Use when cumulative magnitude over an ordered x-axis is more important than individual points.",
      ribbon: "Best for uncertainty bands, intervals, forecasts, and min-max envelopes around a line.",
      bar_count: "Best for counting observations in categories when no numeric y variable is supplied.",
      column: "Best for comparing a numeric value across a small or moderate number of categories.",
      stacked_bar: "Best for showing category totals split into subgroups when totals remain important.",
      filled_bar: "Best for comparing proportions within each category while normalising totals to 100 percent.",
      horizontal_bar: "Best for long category labels or ranked comparisons.",
      polar_bar: "Use sparingly for cyclic or radial displays where circular layout adds meaning.",
      histogram: "Best for showing the shape, centre, spread, and tails of one numeric distribution.",
      density: "Best for a smooth distribution summary, especially when comparing a few groups.",
      dotplot: "Best for small to medium distributions where individual counts should remain visible.",
      boxplot: "Best for compact comparison of medians, spread, and outliers across groups.",
      violin: "Best for comparing full distribution shapes across groups.",
      jitter: "Best for raw observations over categories when points would otherwise overlap.",
      quasirandom: "Best for a tidy beeswarm-style view of raw observations by group.",
      ridgeline: "Best for comparing many related distributions along one ordered or categorical dimension.",
      heatmap: "Best for matrix-like data where colour encodes magnitude across two categorical axes.",
      bin2d: "Best for dense scatterplots where overplotting hides local concentration.",
      hex: "Best for dense scatterplots when hexagonal bins give a smoother spatial summary.",
      contour: "Best for showing smooth density or surface levels as lines over two numeric dimensions.",
      contour_filled: "Best for showing filled bands of a smooth surface or density over two numeric dimensions.",
      rug: "Best as a small marginal cue showing where individual x and y observations fall.",
      text: "Best when individual observations need direct labels and there is enough space.",
      label: "Best when labels need a boxed background for readability.",
      repel_text: "Best when labels matter but overlap must be reduced automatically.",
      rich_text: "Best for labels containing simple Markdown, HTML styling, or emphasis.",
      errorbar: "Best for uncertainty intervals around category estimates.",
      pointrange: "Best for estimates where the point and interval are equally important.",
      lollipop: "Best as a lighter alternative to bars for ranking or category comparisons.",
      segment: "Best for arrows, paired changes, slopes, and start-end relationships.",
      facet_scatter: "Best when the same scatter relationship should be compared across groups.",
      small_multiple_line: "Best when many related time series are easier to compare in separate panels."
    };
    return uses[id] || "Use this when its visual geometry matches the comparison you want readers to make.";
  }

  function thumbSvg(kind) {
    const axis = `<line x1="14" y1="64" x2="126" y2="64" stroke="currentColor" opacity=".25"/><line x1="14" y1="8" x2="14" y2="64" stroke="currentColor" opacity=".25"/>`;
    const dots = `<circle cx="28" cy="49" r="3.8"/><circle cx="48" cy="42" r="3.8"/><circle cx="70" cy="28" r="3.8"/><circle cx="95" cy="20" r="3.8"/><circle cx="112" cy="34" r="3.8"/>`;
    let body = dots;
    if (kind === "bubble") body = `<circle cx="28" cy="49" r="4"/><circle cx="50" cy="42" r="8" opacity=".82"/><circle cx="72" cy="28" r="12" opacity=".7"/><circle cx="101" cy="22" r="7"/><circle cx="116" cy="39" r="10" opacity=".65"/>`;
    if (["line", "step", "area", "smooth", "ribbon"].includes(kind)) body = `<path d="M22 50 C42 42 51 22 71 30 S96 47 118 18" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>` + (kind === "area" ? `<path d="M22 50 C42 42 51 22 71 30 S96 47 118 18 L118 64 L22 64Z" opacity=".18"/>` : "") + (kind === "ribbon" ? `<path d="M22 56 C42 48 51 31 71 38 S96 53 118 27 L118 9 C96 37 87 20 71 22 S42 34 22 43Z" opacity=".18"/>` : "");
    if (kind === "step") body = `<path d="M22 52 H42 V40 H63 V30 H88 V21 H118" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (["bar", "column", "stacked", "filled", "hbar", "polar"].includes(kind)) body = kind === "hbar" ? `<rect x="22" y="16" width="74" height="9" rx="3"/><rect x="22" y="33" width="98" height="9" rx="3"/><rect x="22" y="50" width="52" height="9" rx="3"/>` : `<rect x="25" y="35" width="14" height="29" rx="3"/><rect x="53" y="20" width="14" height="44" rx="3"/><rect x="81" y="29" width="14" height="35" rx="3"/><rect x="109" y="12" width="14" height="52" rx="3"/>`;
    if (kind === "hist") body = `<rect x="18" y="47" width="13" height="17"/><rect x="31" y="36" width="13" height="28"/><rect x="44" y="24" width="13" height="40"/><rect x="57" y="16" width="13" height="48"/><rect x="70" y="24" width="13" height="40"/><rect x="83" y="34" width="13" height="30"/><rect x="96" y="45" width="13" height="19"/>`;
    if (kind === "density" || kind === "ridge") body = `<path d="M18 61 C31 60 32 35 44 35 C57 35 58 12 72 12 C90 12 89 49 108 49 C117 49 118 61 124 61" fill="currentColor" opacity=".18"/><path d="M18 61 C31 60 32 35 44 35 C57 35 58 12 72 12 C90 12 89 49 108 49 C117 49 118 61 124 61" fill="none" stroke="currentColor" stroke-width="4"/>`;
    if (["box", "violin", "jitter", "bee"].includes(kind)) body = kind === "violin" ? `<path d="M43 12 C26 26 27 47 43 62 C59 47 60 26 43 12Z" opacity=".25"/><path d="M92 18 C76 30 78 48 92 62 C108 48 109 30 92 18Z" opacity=".25"/><line x1="43" y1="16" x2="43" y2="61" stroke="currentColor" stroke-width="3"/><line x1="92" y1="20" x2="92" y2="61" stroke="currentColor" stroke-width="3"/>` : `<rect x="29" y="25" width="26" height="26" rx="4" fill="none" stroke="currentColor" stroke-width="4"/><line x1="42" y1="12" x2="42" y2="64" stroke="currentColor" stroke-width="3"/><rect x="84" y="18" width="26" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="4"/><line x1="97" y1="10" x2="97" y2="61" stroke="currentColor" stroke-width="3"/>`;
    if (["tile", "bin2d", "hex"].includes(kind)) body = Array.from({ length: 4 }, (_, i) => Array.from({ length: 5 }, (_, j) => `<rect x="${22 + j * 20}" y="${12 + i * 13}" width="17" height="10" rx="2" opacity="${0.18 + (i+j)/12}"/>`).join("")).join("");
    if (kind === "contour") body = `<path d="M34 51 C20 36 35 17 58 22 C82 27 82 58 58 59 C48 60 40 56 34 51Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M53 47 C43 38 50 28 63 31 C77 34 75 51 62 52 C59 53 56 51 53 47Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M88 51 C77 39 82 24 98 22 C116 20 123 40 113 53 C107 61 96 59 88 51Z" fill="none" stroke="currentColor" stroke-width="3"/>`;
    if (kind === "contourfilled") body = `<path d="M26 56 C16 38 33 13 59 20 C86 27 84 62 57 64 C43 65 32 61 26 56Z" opacity=".18"/><path d="M38 52 C30 40 41 25 60 27 C77 30 77 54 60 56 C50 57 43 56 38 52Z" opacity=".32"/><path d="M51 47 C45 39 52 34 62 35 C72 37 71 48 62 50 C58 50 54 49 51 47Z" opacity=".55"/><path d="M90 55 C78 40 84 23 100 20 C119 17 128 39 116 55 C109 65 98 64 90 55Z" opacity=".26"/>`;
    if (["text", "label", "repel", "rich"].includes(kind)) body = `<rect x="23" y="18" width="42" height="18" rx="6" fill="none" stroke="currentColor" stroke-width="3"/><text x="31" y="31" font-size="13" font-family="sans-serif" fill="currentColor">A</text><circle cx="36" cy="54" r="4"/><circle cx="82" cy="45" r="4"/><rect x="80" y="16" width="38" height="18" rx="6" fill="none" stroke="currentColor" stroke-width="3"/><text x="91" y="30" font-size="13" font-family="serif" fill="currentColor">π</text>`;
    if (["error", "range", "lollipop", "segment"].includes(kind)) body = `<line x1="35" y1="54" x2="35" y2="20" stroke="currentColor" stroke-width="4"/><line x1="26" y1="54" x2="44" y2="54" stroke="currentColor" stroke-width="3"/><line x1="26" y1="20" x2="44" y2="20" stroke="currentColor" stroke-width="3"/><circle cx="35" cy="37" r="5"/><line x1="80" y1="58" x2="112" y2="18" stroke="currentColor" stroke-width="4"/><circle cx="80" cy="58" r="5"/><circle cx="112" cy="18" r="5"/>`;
    if (kind === "facet" || kind === "facetline") body = `<rect x="18" y="12" width="46" height="22" rx="4" fill="none" stroke="currentColor" opacity=".35"/><rect x="76" y="12" width="46" height="22" rx="4" fill="none" stroke="currentColor" opacity=".35"/><rect x="18" y="42" width="46" height="22" rx="4" fill="none" stroke="currentColor" opacity=".35"/><rect x="76" y="42" width="46" height="22" rx="4" fill="none" stroke="currentColor" opacity=".35"/><path d="M23 29 L34 22 L48 26 L60 17" fill="none" stroke="currentColor" stroke-width="3"/><path d="M81 29 L94 19 L106 25 L119 16" fill="none" stroke="currentColor" stroke-width="3"/><path d="M23 58 L35 52 L48 54 L60 47" fill="none" stroke="currentColor" stroke-width="3"/><path d="M81 58 L94 48 L108 54 L119 46" fill="none" stroke="currentColor" stroke-width="3"/>`;
    return `<svg viewBox="0 0 140 76" aria-hidden="true"><g fill="currentColor" stroke="none">${axis}${body}</g></svg>`;
  }

  function renderBuilder() {
    app.innerHTML = `
      <div class="app-shell">
        ${topbarHtml()}
        <main class="grid-main">
          ${dataPanelHtml()}
          ${previewPanelHtml()}
          ${settingsPanelHtml()}
        </main>
      </div>
      <input type="file" id="importJsonFile" class="file-input" accept=".json,application/json,text/json,text/plain">
    `;
  }

  function dataPanelHtml() {
    return `<aside class="side panel card-pad">
      <div class="section-title">
        <div><h2>Data and mappings</h2><p>Upload CSV, then drag columns into aesthetic slots.</p></div>
        <button class="btn small" id="newPlotType">Plot gallery</button>
      </div>
      <div class="toolbar" style="justify-content:flex-start;margin-bottom:10px">
        <label class="btn">Upload CSV<input class="file-input" type="file" id="csvUpload" accept=".csv,text/csv"></label>
        <button class="btn" id="pasteCsvToggle">Paste CSV</button>
        <button class="btn" id="guessMappings">Guess</button>
      </div>
      <div id="pasteCsvBox" class="hidden">
        <textarea class="textarea" id="csvTextarea" spellcheck="false">${escapeHtml(state.csv)}</textarea>
        <div class="toolbar" style="justify-content:flex-start;margin-top:6px"><button class="btn primary" id="applyPastedCsv">Use pasted CSV</button></div>
      </div>
      <div class="pill" style="margin-bottom:10px">${escapeHtml(dataset.name)} · ${dataset.rows.length} rows · ${dataset.columns.length} columns</div>
      <div class="drop-grid" style="margin-bottom:12px">
        ${mappingSlots.map(slotHtml).join("")}
      </div>
      <div class="search-box">
        <input class="input" id="columnSearch" placeholder="Search columns" />
      </div>
      <div class="columns-list" id="columnsList">
        ${dataset.columns.map(columnPillHtml).join("")}
      </div>
    </aside>`;
  }

  function slotHtml([key, label, help]) {
    const val = state.mappings[key] || "";
    return `<div class="drop-slot ${val ? "filled" : "empty"}" data-slot="${key}" title="${escapeHtml(help)}">
      <strong>${escapeHtml(label)}</strong>
      <span>${val ? escapeHtml(val) : "Drop column"}</span>
      ${val ? `<button class="btn small" data-clear-slot="${key}" title="Clear ${escapeHtml(label)}">Clear</button>` : ""}
    </div>`;
  }

  function columnPillHtml(c) {
    return `<button class="column-pill" draggable="true" data-column="${escapeHtml(c.name)}" title="Drag ${escapeHtml(c.name)} to a mapping slot. Distinct: ${c.distinct}; missing: ${c.missing}.">
      <span class="column-name">☷ ${escapeHtml(c.name)}</span><span class="column-type">${escapeHtml(c.type)}</span>
    </button>`;
  }

  function previewPanelHtml() {
    return `<section class="preview panel">
      <div class="card-pad">
        <div class="section-title">
          <div><h2>Live chart</h2><p>Rendered with ${state.backend === "webr" ? "WebR in this browser" : "local R through Plumber"}.</p></div>
          <div class="toolbar">
            <button class="btn primary" id="renderNow" ${isRendering ? "disabled" : ""}>${isRendering ? "Rendering" : "Render"}</button>
            <button class="btn" id="downloadChart" ${resultUrl ? "" : "disabled"}>Download chart</button>
          </div>
        </div>
        <div class="toolbar" style="justify-content:flex-start">
          <span class="pill">${state.export.format.toUpperCase()}</span>
          <span class="pill">${state.export.units === "cm" ? `${state.export.widthCm} × ${state.export.heightCm} cm` : `${state.export.widthPx} × ${state.export.heightPx} px`}</span>
          <span class="pill">Aspect ${formatRatio(state.export.aspectRatio)}</span>
        </div>
        ${formatPreviewWarningHtml()}
      </div>
      <div class="preview-stage">
        <div class="preview-box ${isRendering ? "busy" : ""}" id="previewBox">${previewContentHtml()}${isRendering ? renderSpinnerHtml() : ""}</div>
      </div>
      <div class="statusbar"><span id="statusText">${escapeHtml(statusMessage)}</span><span id="saveStateStatus">Saved in browser storage</span></div>
      <div class="code-wrap">
        <div class="code-tools">
          <div class="toolbar">
            <button class="btn small" id="copyCode">Copy R code</button>
            <button class="btn small" id="downloadCode">Download R</button>
            <button class="btn small" id="downloadJson">Download JSON state</button>
            <button class="btn small" id="importJson">Import JSON state</button>
            <button class="btn small" id="importMagicCode">Paste magic state</button>
          </div>
          <span class="help">The downloaded R file is raw code, not the highlighted HTML preview.</span>
        </div>
        <pre class="code" id="codePreview"></pre>
      </div>
    </section>`;
  }

  function renderSpinnerHtml() {
    const label = state.backend === "webr" ? "WebR is rendering or installing packages" : "Local R is rendering";
    return `<div class="render-overlay"><div class="spinner"></div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(statusMessage)}</span></div>`;
  }

  function formatPreviewWarningHtml() {
    if (state.export.format !== "emf") return "";
    return `<div class="format-warning" role="note"><strong>SVG preview note.</strong> This is an SVG preview generated from the same plot settings. The downloadable EMF may differ a bit from the preview.</div>`;
  }

  function previewContentHtml() {
    if (lastError) return `<div class="error-bubble"><div class="error-icon">!</div><div><h3>Render error</h3><p>${escapeHtml(lastError)}</p></div></div>`;
    if (!resultUrl && state.export.format === "emf") return `<div class="preview-msg"><h3>EMF export selected</h3><p>After rendering, the app will show an SVG preview here and keep the real EMF available from Download chart.</p></div>`;
    if (!resultUrl) return `<div class="preview-msg"><h3>Choose settings, then render.</h3><p>The chart will appear here. SVG, PNG, JPG, and TIFF preview directly; PDF opens inside a browser frame when supported.</p></div>`;
    const mime = asText(resultMime);
    if (state.export.format === "emf") {
      if (resultSvgText) return `<div class="svg-preview" aria-label="SVG preview for EMF export">${resultSvgText}</div>`;
      const detail = resultPreviewNote ? ` ${escapeHtml(resultPreviewNote)}` : "";
      return `<div class="preview-msg"><h3>EMF ready for download</h3><p>The downloadable EMF is ready. SVG preview could not be generated.${detail}</p></div>`;
    }
    if (mime === "application/pdf") return `<iframe src="${resultUrl}" title="Chart PDF preview"></iframe>`;
    if (mime === "image/svg+xml" && resultSvgText) return `<div class="svg-preview" aria-label="Rendered SVG chart preview">${resultSvgText}</div>`;
    if (mime === "image/tiff") {
      if (resultTiffPreviewUrl) return `<div class="tiff-preview"><img src="${resultTiffPreviewUrl}" alt="Rendered TIFF chart preview"><p class="help">TIFF preview is decoded in the browser with UTIF.js. Download chart still gives the original TIFF file.</p></div>`;
      const detail = resultTiffPreviewError ? ` ${escapeHtml(resultTiffPreviewError)}` : "";
      return `<div class="preview-msg"><h3>Rendered TIFF</h3><p>This browser could not create a TIFF preview.${detail} The original TIFF is available from Download chart.</p></div>`;
    }
    if (mime && mime.startsWith("image/")) return `<img src="${resultUrl}" alt="Rendered chart">`;
    return `<div class="preview-msg"><h3>Rendered ${escapeHtml(state.export.format.toUpperCase())}</h3><p>This browser may not preview this format, but it is available from Download chart.</p></div>`;
  }

  function settingsPanelHtml() {
    const tabs = settingsTabs();
    const query = String(state.settingsSearch || "").trim();
    return `<aside class="settings panel card-pad">
      <div class="section-title"><div><h2>Settings</h2><p>Common controls first, advanced settings discoverable in sections.</p></div></div>
      <div class="field setting-search">
        <label>Find a setting</label>
        <input class="input" id="settingsSearch" value="${escapeHtml(state.settingsSearch || "")}" placeholder="Search settings, e.g. legend, grid, angle, palette, markdown">
      </div>
      ${query ? `<div id="settingsSearchResults">${settingsSearchResultsHtml()}</div>` : `<div class="tabs">${tabs.map(([id, label]) => `<button class="tab ${activeTab === id ? "active" : ""}" data-tab="${id}">${label}</button>`).join("")}</div>${settingsTabHtml(activeTab)}`}
    </aside>`;
  }

  function settingsTabs() {
    return [
      ["layers", "Layers"], ["labels", "Text"], ["axes", "Axes"], ["style", "Style"], ["legend", "Legend"], ["facet", "Facets"], ["annotations", "Annotations"], ["export", "Export"], ["advanced", "Advanced"]
    ];
  }

  function settingsIndex() {
    const rows = [
      ["layers", "Add layer", "addLayerGeom", "geom point line bar histogram density smooth ggrepel richtext"],
      ["layers", "Layer geom", "layers.0.geom", "geom layer type"],
      ["layers", "Layer position", "layers.0.position", "stack dodge fill jitter identity"],
      ["layers", "Layer alpha", "layers.0.alpha", "opacity transparency"],
      ["layers", "Layer size", "layers.0.size", "point text size"],
      ["layers", "Line width", "layers.0.linewidth", "stroke linewidth"],
      ["labels", "Title", "labels.title", "plot title markdown html equation"],
      ["labels", "Title rendering", "labels.titleMode", "plain markdown html equation latex2exp"],
      ["labels", "Subtitle", "labels.subtitle", "plot subtitle"],
      ["labels", "Caption", "labels.caption", "plot caption"],
      ["labels", "Title alignment", "labels.titleAlign", "title subtitle caption align hjust left centre right"],
      ["labels", "Title area", "labels.titleArea", "plot title position title area plot panel"],
      ["labels", "Subtitle area", "labels.subtitleArea", "subtitle position area plot panel"],
      ["labels", "Caption area", "labels.captionArea", "caption position caption area plot panel"],
      ["labels", "X title", "labels.xTitle", "axis x title label"],
      ["labels", "Y title", "labels.yTitle", "axis y title label"],
      ["labels", "Legend titles", "labels.colorTitle", "colour fill size alpha shape legend title"],
      ["axes", "X limits", "axis.xMin", "x min max lower upper limits"],
      ["axes", "Y limits", "axis.yMin", "y min max lower upper limits"],
      ["axes", "X transform", "axis.xTransform", "log sqrt reverse transform"],
      ["axes", "Y transform", "axis.yTransform", "log sqrt reverse transform"],
      ["axes", "X labels", "axis.xLabel", "comma percent euro currency scientific label"],
      ["axes", "Y labels", "axis.yLabel", "comma percent euro currency scientific label"],
      ["axes", "Axis tick density", "axis.xBreaks", "ticks breaks grid line density n.breaks"],
      ["axes", "X text angle", "axis.xAngle", "angle rotate axis text"],
      ["axes", "Y text angle", "axis.yAngle", "angle rotate axis text"],
      ["axes", "X title position", "axis.xTitlePosition", "axis title position x left centre right"],
      ["axes", "Y title position", "axis.yTitlePosition", "axis title position y bottom middle top"],
      ["axes", "Coordinates", "axis.flip", "flip polar fixed coordinate ratio clip"],
      ["axes", "Secondary Y axis", "axis.secondaryY", "double axis secondary factor offset"],
      ["style", "Theme preset", "theme.preset", "minimal classic bw dark void economist tufte theme"],
      ["style", "Base font family", "theme.baseFamily", "font family typeface local web"],
      ["style", "Base size", "theme.baseSize", "font size base"],
      ["style", "Text colour", "theme.textColor", "color colour text"],
      ["style", "Title size", "theme.titleSize", "font size title"],
      ["style", "Title face", "theme.titleFace", "bold italic face title"],
      ["style", "Axis text size", "theme.axisTextSize", "font size axis"],
      ["style", "Facet strip size", "theme.stripTextSize", "facet strip text"],
      ["style", "Plot background", "theme.plotBackground", "background bg plot"],
      ["style", "Panel background", "theme.panelBackground", "background bg panel"],
      ["style", "Grid colour", "theme.gridColor", "grid color colour"],
      ["style", "Major grid", "theme.majorGrid", "grid remove show"],
      ["style", "Minor grid", "theme.minorGrid", "grid remove show"],
      ["style", "Panel border", "theme.panelBorder", "border panel remove"],
      ["style", "Colour palette", "palette.color", "palette colour color discrete continuous"],
      ["style", "Fill palette", "palette.fill", "palette fill color colour"],
      ["legend", "Show legend", "legend.show", "legend display remove hide"],
      ["legend", "Legend position", "legend.position", "right left top bottom none inside"],
      ["legend", "Legend direction", "legend.direction", "horizontal vertical"],
      ["legend", "Inside legend", "legend.inside", "inside panel legend x y"],
      ["legend", "Legend justification", "legend.justification", "align justification"],
      ["legend", "Legend title size", "legend.titleSize", "legend font title size"],
      ["legend", "Legend text size", "legend.textSize", "legend font text size"],
      ["legend", "Legend key size", "legend.keySizePt", "legend key symbol size"],
      ["legend", "Guide rows", "legend.nrow", "guide legend rows columns"],
      ["facet", "Facet mode", "facet.mode", "facet wrap grid small multiples"],
      ["facet", "Wrap by", "facet.wrapBy", "facet wrap variable"],
      ["facet", "Facet scales", "facet.scales", "free fixed scales"],
      ["annotations", "Add annotation", "addAnnotationType", "text label rich text hline vline rectangle segment"],
      ["annotations", "Annotation text", "annotations.0.label", "annotation label markdown html equation"],
      ["export", "Format", "export.format", "svg png pdf jpg tiff emf"],
      ["export", "Units", "export.units", "centimeters pixels cm px"],
      ["export", "Aspect ratio", "export.aspectRatio", "aspect ratio width height lock"],
      ["export", "Width", "export.widthCm", "width cm px"],
      ["export", "Height", "export.heightCm", "height cm px"],
      ["export", "DPI", "export.dpi", "dpi raster resolution"],
      ["export", "Export background", "export.bg", "background export"],
      ["advanced", "Extra packages", "advanced.extraPackages", "library packages"],
      ["advanced", "Before plot code", "advanced.beforePlotCode", "custom R code"],
      ["advanced", "Extra ggplot layers", "advanced.extraLayersCode", "custom layers"],
      ["advanced", "Scale overrides", "advanced.scaleOverridesCode", "scale custom override"],
      ["advanced", "Theme overrides", "advanced.themeOverridesCode", "theme custom override"]
    ];
    return rows.map(([tab, label, path, keywords]) => ({ tab, label, path, keywords }));
  }

  function settingsSearchResultsHtml() {
    const q = String(state.settingsSearch || "").trim().toLowerCase();
    if (!q) return "";
    const tabLabel = Object.fromEntries(settingsTabs().map(([id, label]) => [id, label]));
    const hits = settingsIndex().filter(item => `${item.label} ${tabLabel[item.tab] || ""} ${item.keywords || ""}`.toLowerCase().includes(q)).slice(0, 60);
    if (!hits.length) return `<div class="preview-msg mini"><h3>No matching setting</h3><p>Try another word such as font, legend, grid, palette, axis, markdown, or export.</p></div>`;
    return `<div class="search-results">${hits.map(item => `<button class="search-result" data-jump-setting="${escapeHtml(item.path)}" data-jump-tab="${escapeHtml(item.tab)}"><span>${escapeHtml(item.label)}</span><small>${escapeHtml(tabLabel[item.tab] || item.tab)}</small></button>`).join("")}</div>`;
  }

  function settingsTabHtml(tab) {
    if (tab === "layers") return layersTabHtml();
    if (tab === "labels") return labelsTabHtml();
    if (tab === "axes") return axesTabHtml();
    if (tab === "style") return styleTabHtml();
    if (tab === "legend") return legendTabHtml();
    if (tab === "facet") return facetTabHtml();
    if (tab === "annotations") return annotationsTabHtml();
    if (tab === "export") return exportTabHtml();
    return advancedTabHtml();
  }

  function layersTabHtml() {
    return `<div>
      <div class="field">
        <label>Add layer</label>
        <div class="two"><select class="select" id="addLayerGeom">${geomCatalog.map(([id, label]) => `<option value="${id}">${escapeHtml(label)}</option>`).join("")}</select><button class="btn" id="addLayer">Add</button></div>
      </div>
      <p class="help">The builder no longer uses a separate “Layer name”. Layer headings are builder-only descriptions and do not affect R code.</p>
      ${state.layers.map((layer, i) => layerCardHtml(layer, i)).join("")}
    </div>`;
  }

  function layerCardHtml(layer, i) {
    const prefix = `layers.${i}`;
    return `<div class="layer-card">
      <div class="layer-head">
        <strong>${i + 1}. ${escapeHtml(geomLabel(layer.geom))} ${geomDocLink(layer.geom)}</strong>
        <div class="toolbar">
          ${switchHtml(`${prefix}.enabled`, layer.enabled)}
          <button class="btn small" data-duplicate-layer="${i}">Duplicate</button>
          <button class="btn small danger" data-remove-layer="${i}">Remove</button>
        </div>
      </div>
      <div class="two">
        ${selectField("Geom", `${prefix}.geom`, layer.geom, geomCatalog, true)}
        ${selectField("Position", `${prefix}.position`, layer.position, [["identity", "Identity"], ["stack", "Stack"], ["dodge", "Dodge"], ["fill", "Fill"], ["jitter", "Jitter"]])}
      </div>
      ${sliderField("Alpha", `${prefix}.alpha`, layer.alpha, 0, 1, 0.01)}
      ${sliderField("Size", `${prefix}.size`, layer.size, 0.1, 12, 0.1)}
      ${sliderField("Line width", `${prefix}.linewidth`, layer.linewidth, 0.1, 6, 0.1)}
      ${colorField("Fixed colour", `${prefix}.color`, layer.color || "", true, true)}
      ${colorField("Fixed fill", `${prefix}.fill`, layer.fill || "", true, true)}
      ${["histogram", "bin2d", "hex", "dotplot"].includes(layer.geom) ? `<div class="two">${numberField("Bins", `${prefix}.bins`, layer.bins, 1, 200, 1)}${textField("Bin width", `${prefix}.binwidth`, layer.binwidth || "", "Optional R expression")}</div>` : ""}
      ${layer.geom === "smooth" ? `<div class="two">${selectField("Method", `${prefix}.smoothMethod`, layer.smoothMethod, [["auto", "Auto"], ["lm", "lm"], ["loess", "loess"], ["gam", "gam"]])}<label class="toggle-row"><span class="label">SE band</span>${switchHtml(`${prefix}.smoothSe`, layer.smoothSe)}</label></div>` : ""}
      ${layer.geom.includes("repel") ? `${sliderField("Repel force", `${prefix}.repelForce`, layer.repelForce, 0, 10, 0.1)}<div class="two">${textField("Nudge X", `${prefix}.labelNudgeX`, layer.labelNudgeX || "", "R expression")}${textField("Nudge Y", `${prefix}.labelNudgeY`, layer.labelNudgeY || "", "R expression")}</div>` : ""}
      ${["text", "label", "text_repel", "label_repel", "richtext"].includes(layer.geom) ? `<div class="two">${textField("Nudge X", `${prefix}.labelNudgeX`, layer.labelNudgeX || "", "R expression")}${textField("Nudge Y", `${prefix}.labelNudgeY`, layer.labelNudgeY || "", "R expression")}</div>` : ""}
      ${layer.geom === "richtext" ? selectField("Rich text mode", `${prefix}.richTextMode`, layer.richTextMode || "markdown", [["markdown", "Markdown or HTML"], ["plain", "Plain text"]]) : ""}
      <details class="details" open><summary>Layer-specific raw ggplot arguments</summary>${textareaField("Custom arguments", `${prefix}.customParams`, layer.customParams || "", "Example: na.rm = TRUE")}</details>
    </div>`;
  }

  function labelsTabHtml() {
    return `<div>
      ${textField("Title", "labels.title", state.labels.title, "Supports plain text, markdown/html, or equations by mode below")}
      <div class="two">${selectField("Title rendering", "labels.titleMode", state.labels.titleMode, [["plain", "Plain"], ["markdown", "Markdown or HTML"], ["equation", "Equation via latex2exp"]])}${selectField("Title alignment", "labels.titleAlign", state.labels.titleAlign, textAlignOptions())}</div>
      ${selectField("Title area", "labels.titleArea", state.labels.titleArea, plotTextAreaOptions())}
      ${textField("Subtitle", "labels.subtitle", state.labels.subtitle, "")}
      <div class="two">${selectField("Subtitle rendering", "labels.subtitleMode", state.labels.subtitleMode, [["plain", "Plain"], ["markdown", "Markdown or HTML"], ["equation", "Equation via latex2exp"]])}${selectField("Subtitle alignment", "labels.subtitleAlign", state.labels.subtitleAlign, textAlignOptions())}</div>
      ${selectField("Subtitle area", "labels.subtitleArea", state.labels.subtitleArea, plotTextAreaOptions())}
      ${textField("Caption", "labels.caption", state.labels.caption, "")}
      <div class="two">${selectField("Caption rendering", "labels.captionMode", state.labels.captionMode, [["plain", "Plain"], ["markdown", "Markdown or HTML"], ["equation", "Equation via latex2exp"]])}${selectField("Caption alignment", "labels.captionAlign", state.labels.captionAlign, textAlignOptions())}</div>
      ${selectField("Caption area", "labels.captionArea", state.labels.captionArea, plotTextAreaOptions())}
      <div class="two">${textField("X title", "labels.xTitle", state.labels.xTitle, "")}${textField("Y title", "labels.yTitle", state.labels.yTitle, "")}</div>
      ${selectField("Axis title rendering", "labels.axisMode", state.labels.axisMode, [["plain", "Plain"], ["markdown", "Markdown or HTML"], ["equation", "Equation via latex2exp"]])}
      <details class="details" open><summary>Legend titles</summary>
        <div class="two">${textField("Colour", "labels.colorTitle", state.labels.colorTitle, "")}${textField("Fill", "labels.fillTitle", state.labels.fillTitle, "")}</div>
        <div class="three">${textField("Size", "labels.sizeTitle", state.labels.sizeTitle, "")}${textField("Alpha", "labels.alphaTitle", state.labels.alphaTitle, "")}${textField("Shape", "labels.shapeTitle", state.labels.shapeTitle, "")}</div>
        ${selectField("Legend text rendering", "labels.legendMode", state.labels.legendMode, [["plain", "Plain"], ["markdown", "Markdown or HTML"]])}
      </details>
      <p class="help">For markdown/html, ggtext is used for theme text elements and rich annotations. For equations, latex2exp converts LaTeX-like expressions to plotmath.</p>
    </div>`;
  }

  function axesTabHtml() {
    return `<div>
      <div class="two">${linkedLimitField("X limits", "axis.xMin", "axis.xMax", state.axis.xMin, state.axis.xMax)}${linkedLimitField("Y limits", "axis.yMin", "axis.yMax", state.axis.yMin, state.axis.yMax)}</div>
      <div class="two">${selectField("X transform", "axis.xTransform", state.axis.xTransform, [["none", "None"], ["log10", "log10"], ["sqrt", "sqrt"], ["reverse", "reverse"]])}${selectField("Y transform", "axis.yTransform", state.axis.yTransform, [["none", "None"], ["log10", "log10"], ["sqrt", "sqrt"], ["reverse", "reverse"]])}</div>
      <div class="two">${selectField("X labels", "axis.xLabel", state.axis.xLabel, [["default", "Default"], ["comma", "Comma"], ["percent", "Percent"], ["euro", "Euro"], ["scientific", "Scientific"]])}${selectField("Y labels", "axis.yLabel", state.axis.yLabel, [["default", "Default"], ["comma", "Comma"], ["percent", "Percent"], ["euro", "Euro"], ["scientific", "Scientific"]])}</div>
      <details class="details" open><summary>Tick and grid-line density</summary>
        <div class="two">${numberField("X major tick target", "axis.xBreaks", state.axis.xBreaks, 2, 40, 1)}${numberField("Y major tick target", "axis.yBreaks", state.axis.yBreaks, 2, 40, 1)}</div>
        <p class="help">These are target counts for major axis ticks; major grid lines follow those ticks when major grids are shown.</p>
      </details>
      ${angleField("X text angle", "axis.xAngle", state.axis.xAngle)}
      ${angleField("Y text angle", "axis.yAngle", state.axis.yAngle)}
      <details class="details" open><summary>Axis title positions</summary>
        <div class="two">${selectField("X title position", "axis.xTitlePosition", state.axis.xTitlePosition, [["left", "Left"], ["center", "Centre"], ["right", "Right"]])}${selectField("Y title position", "axis.yTitlePosition", state.axis.yTitlePosition, [["bottom", "Bottom"], ["middle", "Middle"], ["top", "Top"]])}</div>
        <div class="two">${numberField("X title distance pt", "axis.xTitleMarginPt", state.axis.xTitleMarginPt, 0, 100, 1)}${numberField("Y title distance pt", "axis.yTitleMarginPt", state.axis.yTitleMarginPt, 0, 100, 1)}</div>
      </details>
      <details class="details" open><summary>Coordinates and aspect</summary>
        <div class="two"><label class="toggle-row"><span class="label">Flip x and y</span>${switchHtml("axis.flip", state.axis.flip)}</label><label class="toggle-row"><span class="label">Polar coordinates</span>${switchHtml("axis.polar", state.axis.polar)}</label></div>
        <div class="two"><label class="toggle-row"><span class="label">Fixed coordinate ratio</span>${switchHtml("axis.fixed", state.axis.fixed)}</label>${numberField("Coordinate ratio", "axis.coordRatio", state.axis.coordRatio, 0.01, 100, 0.01)}</div>
        ${selectField("Clip drawing", "axis.clip", state.axis.clip, [["on", "On"], ["off", "Off"]])}
      </details>
      <details class="details"><summary>Secondary Y axis</summary>
        <label class="toggle-row"><span class="label">Enable secondary Y axis</span>${switchHtml("axis.secondaryY", state.axis.secondaryY)}</label>
        ${textField("Secondary axis name", "axis.secondaryYName", state.axis.secondaryYName, "")}
        <div class="two">${numberField("Factor", "axis.secondaryYFactor", state.axis.secondaryYFactor, -1e9, 1e9, 0.01)}${numberField("Offset", "axis.secondaryYOffset", state.axis.secondaryYOffset, -1e9, 1e9, 0.01)}</div>
      </details>
    </div>`;
  }

  function styleTabHtml() {
    return `<div>
      ${selectField("Theme preset", "theme.preset", state.theme.preset, themePresetOptions())}
      <label class="toggle-row"><span class="label">Preset overrides style controls</span>${switchHtml("theme.presetOverride", state.theme.presetOverride)}</label>
      ${fontPickerHtml()}
      <div class="two">${numberField("Base size", "theme.baseSize", state.theme.baseSize, 5, 72, 1)}${colorField("Text colour", "theme.textColor", state.theme.textColor)}</div>
      <details class="details" open><summary>Text element sizes and faces</summary>
        <div class="two">${numberField("Title size", "theme.titleSize", state.theme.titleSize, 5, 96, 1)}${selectField("Title face", "theme.titleFace", state.theme.titleFace, faceOptions())}</div>
        <div class="two">${numberField("Subtitle size", "theme.subtitleSize", state.theme.subtitleSize, 5, 96, 1)}${selectField("Subtitle face", "theme.subtitleFace", state.theme.subtitleFace, faceOptions())}</div>
        <div class="two">${numberField("Caption size", "theme.captionSize", state.theme.captionSize, 5, 96, 1)}${selectField("Caption face", "theme.captionFace", state.theme.captionFace, faceOptions())}</div>
        <div class="two">${numberField("Axis title size", "theme.axisTitleSize", state.theme.axisTitleSize, 5, 96, 1)}${selectField("Axis title face", "theme.axisTitleFace", state.theme.axisTitleFace, faceOptions())}</div>
        <div class="two">${numberField("Axis text size", "theme.axisTextSize", state.theme.axisTextSize, 5, 96, 1)}${selectField("Axis text face", "theme.axisTextFace", state.theme.axisTextFace, faceOptions())}</div>
        <div class="two">${numberField("Facet strip size", "theme.stripTextSize", state.theme.stripTextSize, 5, 96, 1)}${selectField("Facet strip face", "theme.stripTextFace", state.theme.stripTextFace, faceOptions())}</div>
      </details>
      <details class="details" open><summary>Backgrounds, grids, and removals</summary>
        ${colorField("Plot bg", "theme.plotBackground", state.theme.plotBackground, true, true)}
        ${colorField("Panel bg", "theme.panelBackground", state.theme.panelBackground, true, true)}
        ${colorField("Grid colour", "theme.gridColor", state.theme.gridColor)}
        <div class="three">${selectField("Major grid", "theme.majorGrid", state.theme.majorGrid, [["line", "Show"], ["blank", "Remove"]])}${selectField("Minor grid", "theme.minorGrid", state.theme.minorGrid, [["line", "Show"], ["blank", "Remove"]])}${selectField("Panel border", "theme.panelBorder", state.theme.panelBorder, [["blank", "Remove"], ["line", "Show"]])}</div>
        <details class="details"><summary>Plot margins</summary>
          <div class="two">${numberField("Top pt", "theme.plotMarginTopPt", state.theme.plotMarginTopPt, 0, 200, 1)}${numberField("Right pt", "theme.plotMarginRightPt", state.theme.plotMarginRightPt, 0, 200, 1)}</div>
          <div class="two">${numberField("Bottom pt", "theme.plotMarginBottomPt", state.theme.plotMarginBottomPt, 0, 200, 1)}${numberField("Left pt", "theme.plotMarginLeftPt", state.theme.plotMarginLeftPt, 0, 200, 1)}</div>
        </details>
        <div class="two"><label class="toggle-row"><span class="label">Remove X title</span>${switchHtml("theme.removeAxisTitleX", state.theme.removeAxisTitleX)}</label><label class="toggle-row"><span class="label">Remove Y title</span>${switchHtml("theme.removeAxisTitleY", state.theme.removeAxisTitleY)}</label></div>
        <div class="two"><label class="toggle-row"><span class="label">Remove X text</span>${switchHtml("theme.removeAxisTextX", state.theme.removeAxisTextX)}</label><label class="toggle-row"><span class="label">Remove Y text</span>${switchHtml("theme.removeAxisTextY", state.theme.removeAxisTextY)}</label></div>
        <div class="two"><label class="toggle-row"><span class="label">Remove ticks</span>${switchHtml("theme.removeTicks", state.theme.removeTicks)}</label><label class="toggle-row"><span class="label">Remove facet strips</span>${switchHtml("theme.removeStrips", state.theme.removeStrips)}</label></div>
      </details>
      <details class="details" open><summary>Palettes</summary>
        ${paletteField("Colour palette", "palette.color", state.palette.color)}
        ${paletteField("Fill palette", "palette.fill", state.palette.fill)}
        ${customPaletteHtml()}
        <label class="toggle-row"><span class="label">Reverse palettes</span>${switchHtml("palette.reverse", state.palette.reverse)}</label>
      </details>
    </div>`;
  }

  function legendTabHtml() {
    return `<div>
      <label class="toggle-row"><span class="label">Show legend</span>${switchHtml("legend.show", state.legend.show)}</label>
      <div class="two">${selectField("Position", "legend.position", state.legend.position, [["right", "Right"], ["left", "Left"], ["top", "Top"], ["bottom", "Bottom"], ["none", "None"]])}${selectField("Direction", "legend.direction", state.legend.direction, [["vertical", "Vertical"], ["horizontal", "Horizontal"]])}</div>
      <label class="toggle-row"><span class="label">Place legend inside panel</span>${switchHtml("legend.inside", state.legend.inside)}</label>
      <div class="two">${numberField("Inside X", "legend.insideX", state.legend.insideX, 0, 1, 0.01)}${numberField("Inside Y", "legend.insideY", state.legend.insideY, 0, 1, 0.01)}</div>
      <div class="two">${selectField("Justification", "legend.justification", state.legend.justification, [["center", "Center"], ["left", "Left"], ["right", "Right"], ["top", "Top"], ["bottom", "Bottom"], ["topright", "Top right"], ["topleft", "Top left"], ["bottomright", "Bottom right"], ["bottomleft", "Bottom left"]])}${selectField("Legend box", "legend.box", state.legend.box, [["vertical", "Vertical"], ["horizontal", "Horizontal"]])}</div>
      <div class="two">${numberField("Title size", "legend.titleSize", state.legend.titleSize, 5, 72, 1)}${selectField("Title face", "legend.titleFace", state.legend.titleFace, faceOptions())}</div>
      <div class="two">${numberField("Text size", "legend.textSize", state.legend.textSize, 5, 72, 1)}${selectField("Text face", "legend.textFace", state.legend.textFace, faceOptions())}</div>
      <div class="three">${numberField("Key size pt", "legend.keySizePt", state.legend.keySizePt, 1, 100, 1)}${numberField("Key width pt", "legend.keyWidthPt", state.legend.keyWidthPt, 1, 160, 1)}${numberField("Key height pt", "legend.keyHeightPt", state.legend.keyHeightPt, 1, 160, 1)}</div>
      <div class="three">${numberField("Spacing X pt", "legend.spacingXPt", state.legend.spacingXPt, 0, 100, 1)}${numberField("Spacing Y pt", "legend.spacingYPt", state.legend.spacingYPt, 0, 100, 1)}${selectField("Title position", "legend.titlePosition", state.legend.titlePosition, [["top", "Top"], ["left", "Left"], ["right", "Right"], ["bottom", "Bottom"]])}</div>
      <div class="two">${textField("Guide rows", "legend.nrow", state.legend.nrow, "Optional")}${textField("Guide columns", "legend.ncol", state.legend.ncol, "Optional")}</div>
      <div class="two"><label class="toggle-row"><span class="label">Reverse guide order</span>${switchHtml("legend.reverse", state.legend.reverse)}</label><label class="toggle-row"><span class="label">Fill guide by row</span>${switchHtml("legend.byrow", state.legend.byrow)}</label></div>
      ${colorField("Legend background", "legend.background", state.legend.background, true, true)}
      ${colorField("Legend border", "legend.border", state.legend.border, true, true)}
      <details class="details" open><summary>Guide override aesthetics</summary>
        <div class="two">${textField("Override point size", "legend.overrideSize", state.legend.overrideSize, "Optional numeric")}${textField("Override alpha", "legend.overrideAlpha", state.legend.overrideAlpha, "Optional 0-1")}</div>
      </details>
    </div>`;
  }

  function facetTabHtml() {
    return `<div>
      ${selectField("Facet mode", "facet.mode", state.facet.mode, [["none", "None"], ["wrap", "Wrap"], ["grid", "Grid"]])}
      ${selectField("Wrap by", "facet.wrapBy", state.facet.wrapBy, [["", "None"], ...dataset.columns.map(c => [c.name, c.name])])}
      <div class="two">${numberField("Wrap columns", "facet.ncol", state.facet.ncol, 1, 12, 1)}${selectField("Scales", "facet.scales", state.facet.scales, [["fixed", "Fixed"], ["free", "Free"], ["free_x", "Free x"], ["free_y", "Free y"]])}</div>
      <p class="help">Facet grid uses the Facet row and Facet col mapping slots. Facet wrap uses the field above.</p>
    </div>`;
  }

  function annotationsTabHtml() {
    return `<div>
      <div class="two"><select class="select" id="addAnnotationType">${[["text", "Plain text"], ["label", "Boxed label"], ["richtext", "Rich text (Markdown/HTML)"], ["hline", "Horizontal line"], ["vline", "Vertical line"], ["rect", "Rectangle"], ["segment", "Segment"]].map(([id, lab]) => `<option value="${id}">${lab}</option>`).join("")}</select><button class="btn" id="addAnnotation">Add annotation</button></div>
      <p class="help">Plain text uses standard ggplot text. Rich text uses ggtext, so simple Markdown and HTML tags can be rendered inside a text box. Equation mode uses latex2exp.</p>
      <p class="help">Annotation coordinates are R expressions, so Inf, -Inf, dates, and numeric values are allowed.</p>
      ${state.annotations.length ? state.annotations.map(annotationCardHtml).join("") : `<div class="preview-msg" style="padding:18px">No annotations yet.</div>`}
    </div>`;
  }

  function annotationCardHtml(a, i) {
    const prefix = `annotations.${i}`;
    return `<div class="annotation-card">
      <div class="layer-head"><strong>${i + 1}. ${escapeHtml(a.type)}</strong><button class="btn small danger" data-remove-annotation="${i}">Remove</button></div>
      ${selectField("Type", `${prefix}.type`, a.type, [["text", "Plain text"], ["label", "Boxed label"], ["richtext", "Rich text (Markdown/HTML)"], ["hline", "Horizontal line"], ["vline", "Vertical line"], ["rect", "Rectangle"], ["segment", "Segment"]], true)}
      ${["text", "label", "richtext"].includes(a.type) ? `${textField("Label", `${prefix}.label`, a.label, "Plain, markdown/html, or equation depending on mode")}${selectField("Rendering", `${prefix}.mode`, a.mode, [["plain", "Plain"], ["markdown", "Markdown or HTML"], ["equation", "Equation via latex2exp"]])}` : ""}
      ${["text", "label", "richtext", "segment"].includes(a.type) ? `<div class="two">${textField("X", `${prefix}.x`, a.x, "R expression")}${textField("Y", `${prefix}.y`, a.y, "R expression")}</div>` : ""}
      ${a.type === "segment" ? `<div class="two">${textField("X end", `${prefix}.xend`, a.xend, "R expression")}${textField("Y end", `${prefix}.yend`, a.yend, "R expression")}</div>` : ""}
      ${a.type === "hline" ? textField("Y intercept", `${prefix}.y`, a.y, "R expression") : ""}
      ${a.type === "vline" ? textField("X intercept", `${prefix}.x`, a.x, "R expression") : ""}
      ${a.type === "rect" ? `<div class="two">${textField("X min", `${prefix}.xmin`, a.xmin, "R expression")}${textField("X max", `${prefix}.xmax`, a.xmax, "R expression")}</div><div class="two">${textField("Y min", `${prefix}.ymin`, a.ymin, "R expression")}${textField("Y max", `${prefix}.ymax`, a.ymax, "R expression")}</div>` : ""}
      <div class="two">${colorField("Colour", `${prefix}.color`, a.color, true, true)}${colorField("Fill", `${prefix}.fill`, a.fill, true, true)}</div>
      ${sliderField("Alpha", `${prefix}.alpha`, a.alpha, 0, 1, 0.01)}
      <div class="two">${numberField("Size", `${prefix}.size`, a.size, 0.1, 30, 0.1)}${numberField("Line width", `${prefix}.linewidth`, a.linewidth, 0.1, 10, 0.1)}</div>
    </div>`;
  }

  function exportTabHtml() {
    return `<div>
      <div class="two">${selectField("Format", "export.format", state.export.format, [["svg", "SVG"], ["png", "PNG"], ["pdf", "PDF"], ["jpg", "JPG"], ["tiff", "TIFF"], ["emf", "EMF"]])}${selectField("Units", "export.units", state.export.units, [["cm", "Centimeters"], ["px", "Pixels"]], true)}</div>
      <label class="toggle-row"><span class="label">Lock aspect ratio</span>${switchHtml("export.lockAspect", state.export.lockAspect)}</label>
      ${aspectRatioField()}
      ${state.export.units === "cm" ? `<div class="two">${numberField("Width cm", "export.widthCm", state.export.widthCm, 1, 200, 0.1, "width")}${numberField("Height cm", "export.heightCm", state.export.heightCm, 1, 200, 0.1, "height")}</div>` : `<div class="two">${numberField("Width px", "export.widthPx", state.export.widthPx, 20, 20000, 1, "width")}${numberField("Height px", "export.heightPx", state.export.heightPx, 20, 20000, 1, "height")}</div>`}
      ${numberField("DPI", "export.dpi", state.export.dpi, 36, 1200, 1)}
      ${colorField("Export background", "export.bg", state.export.bg, true, true)}
      ${formatPreviewWarningHtml()}
      <p class="help">DPI controls raster resolution and pixel-unit conversion in ggsave. EMF export uses devEMF only when EMF is selected.</p>
    </div>`;
  }

  function advancedTabHtml() {
    return `<div>
      ${textField("Extra packages", "advanced.extraPackages", state.advanced.extraPackages, "Comma or space separated package names to library()")}
      ${textareaField("Before plot code", "advanced.beforePlotCode", state.advanced.beforePlotCode, "Runs before ggplot()")}
      ${textareaField("After data code", "advanced.afterDataCode", state.advanced.afterDataCode, "Runs after plot_data is read")}
      ${textareaField("Extra ggplot layers", "advanced.extraLayersCode", state.advanced.extraLayersCode, "Example: geom_smooth(method = 'lm')")}
      ${textareaField("Scale overrides", "advanced.scaleOverridesCode", state.advanced.scaleOverridesCode, "Example: scale_y_log10()")}
      ${textareaField("Theme overrides", "advanced.themeOverridesCode", state.advanced.themeOverridesCode, "Example: theme(legend.position = 'bottom')")}
      ${textareaField("After plot code", "advanced.afterPlotCode", state.advanced.afterPlotCode, "Runs after p is constructed")}
    </div>`;
  }

  function faceOptions() {
    return [["plain", "Plain"], ["bold", "Bold"], ["italic", "Italic"], ["bold.italic", "Bold italic"]];
  }

  function textAlignOptions() {
    return [["left", "Left"], ["center", "Centre"], ["right", "Right"]];
  }

  function plotTextAreaOptions() {
    return [["plot", "Whole plot"], ["panel", "Panel area"]];
  }

  function themePresetOptions() {
    return [
      ["rapid", "Rapid clean"], ["gray", "Gray"], ["minimal", "Minimal"], ["classic", "Classic"], ["bw", "Black and white"], ["light", "Light"], ["dark", "Dark"], ["void", "Void"], ["linedraw", "Line draw"], ["test", "Test"],
      ["economist", "Economist"], ["tufte", "Tufte"], ["few", "Few"], ["fivethirtyeight", "FiveThirtyEight"], ["stata", "Stata"], ["wsj", "Wall Street Journal"], ["solarized", "Solarized"], ["pander", "Pander"], ["calc", "Calc"], ["hc", "Highcharts"], ["excel", "Excel"]
    ];
  }

  function option(value, label, selected) {
    return `<option value="${escapeHtml(value)}" ${String(selected) === String(value) ? "selected" : ""}>${escapeHtml(label)}</option>`;
  }

  function textField(label, path, value, help) {
    return `<div class="field"><label>${escapeHtml(label)}</label><input class="input" data-bind="${path}" value="${escapeHtml(value || "")}" placeholder="${escapeHtml(help || "")}">${help ? `<span class="help">${escapeHtml(help)}</span>` : ""}</div>`;
  }

  function textareaField(label, path, value, help) {
    return `<div class="field"><label>${escapeHtml(label)}</label><textarea class="textarea" data-bind="${path}" spellcheck="false" placeholder="${escapeHtml(help || "")}">${escapeHtml(value || "")}</textarea>${help ? `<span class="help">${escapeHtml(help)}</span>` : ""}</div>`;
  }

  function numberField(label, path, value, min, max, step, aspectDim) {
    return `<div class="field"><label>${escapeHtml(label)}</label><input class="input" type="number" data-bind="${path}" data-type="number" ${aspectDim ? `data-aspect-dim="${aspectDim}"` : ""} value="${escapeHtml(value)}" min="${min}" max="${max}" step="${step}"></div>`;
  }

  function selectField(label, path, value, options, refresh) {
    return `<div class="field"><label>${escapeHtml(label)}</label><select class="select" data-bind="${path}" ${refresh ? "data-refresh=\"true\"" : ""}>${options.map(([v, l]) => option(v, l, value)).join("")}</select></div>`;
  }

  function colorField(label, path, value, allowBlank, removable) {
    const hasValue = Boolean(String(value || "").trim());
    const val = hasValue && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#000000";
    const disabledClass = !hasValue && removable ? " is-disabled" : "";
    const clear = removable ? `<button class="icon-btn remove-colour" data-clear-path="${escapeHtml(path)}" title="Disable ${escapeHtml(label)}">✖</button>` : "";
    const placeholder = allowBlank ? (removable ? "Disabled" : "Transparent") : "#000000";
    return `<div class="field${disabledClass}"><label>${escapeHtml(label)}</label><div class="colour-row ${removable ? "has-remove" : ""}"><input class="input" type="color" data-color-for="${path}" value="${val}" title="Pick ${escapeHtml(label)}"><input class="input" data-bind="${path}" value="${escapeHtml(allowBlank && !value ? "" : value)}" placeholder="${placeholder}">${clear}</div></div>`;
  }

  function sliderField(label, path, value, min, max, step) {
    return `<div class="field"><label>${escapeHtml(label)}</label><div class="slider-row"><input class="input" type="range" data-bind="${path}" data-type="number" value="${escapeHtml(value)}" min="${min}" max="${max}" step="${step}"><input class="input" type="number" data-bind="${path}" data-type="number" value="${escapeHtml(value)}" min="${min}" max="${max}" step="${step}"></div></div>`;
  }

  function angleField(label, path, value) {
    return `<div class="field"><label>${escapeHtml(label)}</label><div class="slider-row"><input class="input" type="range" data-bind="${path}" data-type="number" value="${escapeHtml(value)}" min="-180" max="180" step="1"><input class="input" type="number" data-bind="${path}" data-type="number" value="${escapeHtml(value)}" min="-180" max="180" step="1"></div><span class="help">Range: -180 to +180. Default: 0.</span></div>`;
  }

  function switchHtml(path, checked) {
    return `<label class="switch"><input type="checkbox" data-bind="${path}" data-type="boolean" ${checked ? "checked" : ""}><span></span></label>`;
  }

  function linkedLimitField(label, minPath, maxPath, minVal, maxVal) {
    return `<div class="field"><label>${escapeHtml(label)}</label><div class="two"><input class="input" type="number" data-bind="${minPath}" data-limit-min="${maxPath}" value="${escapeHtml(minVal)}" placeholder="Lower"><input class="input" type="number" data-bind="${maxPath}" data-limit-max="${minPath}" value="${escapeHtml(maxVal)}" placeholder="Upper"></div></div>`;
  }

  function aspectRatioField() {
    const presets = [[1, "1:1"], [1.333333, "4:3"], [1.6, "16:10"], [1.777778, "16:9"], [1.414214, "√2"], [0.707107, "A portrait"]];
    return `<div class="field"><label>Plot aspect ratio</label><div class="subtabs">${presets.map(([v, lab]) => `<button class="chip small ${Math.abs(state.export.aspectRatio - v) < 0.002 ? "active" : ""}" data-aspect="${v}">${lab}</button>`).join("")}</div><input class="input" type="number" data-bind="export.aspectRatio" data-type="number" value="${escapeHtml(state.export.aspectRatio)}" min="0.05" max="50" step="0.01"><span class="help">Aspect is width ÷ height. With lock on, changing width or height updates the other dimension.</span></div>`;
  }

  function fontPickerHtml() {
    const selected = state.theme.baseFamily || "sans";
    return `<div class="field font-picker"><label>Base font family</label>
      <input class="input font-selected" data-bind="theme.baseFamily" data-font-family-input="true" value="${escapeHtml(selected)}" placeholder="sans, serif, mono, or an installed family" style="font-family:${cssString(selected)}, var(--sans)">
      <label>Search available fonts</label>
      <input class="input" id="fontSearch" value="${escapeHtml(state.fontSearch || "")}" placeholder="Type to filter; click a rendered family name below">
      <div class="font-results" id="fontResults">${fontResultsHtml()}</div>
      <span class="help">The menu is refreshed automatically: local R uses installed system fonts; WebR uses Google Fonts and renders SVG previews inline so browser web fonts can apply.</span>
    </div>`;
  }

  function paletteColorsFor(id) {
    if (id === "custom") return (state.palette.customColors || []).filter(isHexColor);
    return (palettes.find(p => p.id === id) || palettes[0]).colors;
  }

  function isHexColor(value) {
    return /^#[0-9A-Fa-f]{6}$/.test(String(value || "").trim());
  }

  function customPaletteHtml() {
    const colours = (state.palette.customColors || []).length ? state.palette.customColors : ["#2563EB", "#DC2626", "#16A34A"];
    return `<details class="details" open><summary>Custom palette</summary>
      <div class="custom-palette" id="customPalette">
        ${colours.map((c, i) => `<div class="palette-stop"><input class="input" type="color" data-palette-color="${i}" value="${escapeHtml(isHexColor(c) ? c : "#000000")}" title="Palette colour ${i + 1}"><input class="input" data-palette-text="${i}" value="${escapeHtml(c)}" placeholder="#2563EB"><button class="icon-btn remove-colour" data-remove-palette-colour="${i}" title="Remove colour">✖</button></div>`).join("")}
      </div>
      <div class="toolbar" style="justify-content:flex-start;margin-top:8px"><button class="btn small" id="addPaletteColour">Add colour</button><button class="btn small" id="useCustomPalette">Use for colour and fill</button></div>
    </details>`;
  }

  function fontResultsHtml() {
    const query = String(state.fontSearch || "").toLowerCase();
    const selected = state.theme.baseFamily || "sans";
    const matches = knownFonts.filter(f => f.family.toLowerCase().includes(query)).slice(0, 120);
    return matches.map(f => `<button class="font-option ${f.family === selected ? "active" : ""}" data-font="${escapeHtml(f.family)}" style="font-family:${cssString(f.family)}, var(--sans)"><span>${escapeHtml(f.family)}</span><small>${escapeHtml(f.source || "")}</small></button>`).join("") || `<div class="help" style="padding:8px">No font names match this search.</div>`;
  }

  function cssString(x) {
    return `"${String(x).replace(/"/g, "").replace(/\\/g, "")}"`;
  }

  function paletteField(label, path, value) {
    const colours = paletteColorsFor(value);
    return `<div class="field"><label>${escapeHtml(label)}</label><select class="select" data-bind="${path}">${palettes.map(p => option(p.id, p.label, value)).join("")}</select><div class="swatches">${colours.map(c => `<span class="swatch" style="background:${escapeHtml(c)}"></span>`).join("")}</div></div>`;
  }

  function geomDocLink(geom) {
    const info = geomDocs[geom];
    if (!info) return "";
    return `<a class="geom-link" href="${escapeHtml(info[1])}" target="_blank" rel="noopener" title="Open manual page for ${escapeHtml(info[0])}">${escapeHtml(info[0])}</a>`;
  }

  function googleFontCssUrl(family) {
    return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}&display=swap`;
  }

  function ensureWebFont(family) {
    const fam = String(family || "").trim();
    if (!webFontFamilies.has(fam) || loadedWebFonts.has(fam)) return;
    ensureFontPreconnects();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.crossOrigin = "anonymous";
    link.href = googleFontCssUrl(fam);
    link.dataset.rapidggFont = fam;
    document.head.appendChild(link);
    loadedWebFonts.add(fam);
    if (document.fonts && document.fonts.load) {
      document.fonts.load(`12px ${cssString(fam)}`).catch(() => {});
      document.fonts.load(`bold 12px ${cssString(fam)}`).catch(() => {});
    }
  }

  function ensureFontPreconnects() {
    if (document.querySelector('link[data-rapidgg-preconnect="fonts"]')) return;
    [
      ["https://fonts.googleapis.com", ""],
      ["https://fonts.gstatic.com", "anonymous"]
    ].forEach(([href, cross]) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = href;
      link.dataset.rapidggPreconnect = "fonts";
      if (cross) link.crossOrigin = cross;
      document.head.appendChild(link);
    });
  }

  function loadVisibleWebFonts() {
    ensureWebFont(state.theme.baseFamily);
    document.querySelectorAll("[data-font]").forEach(el => ensureWebFont(el.dataset.font));
  }

  function normalizeFontPayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    if (Array.isArray(payload.family)) {
      return payload.family.map((family, i) => ({ family, source: Array.isArray(payload.source) ? payload.source[i] : "local R" }));
    }
    return Object.values(payload).flatMap(x => Array.isArray(x) ? x : [x]).filter(Boolean);
  }

  function bindEvents() {
    document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
    document.getElementById("resetAll")?.addEventListener("click", resetAll);
    document.getElementById("undoBtn")?.addEventListener("click", undoState);
    document.getElementById("redoBtn")?.addEventListener("click", redoState);
    document.getElementById("importMagic")?.addEventListener("click", promptMagicImport);
    document.getElementById("importMagicStarter")?.addEventListener("click", promptMagicImport);
    document.getElementById("importMagicCode")?.addEventListener("click", promptMagicImport);
    document.getElementById("continueSaved")?.addEventListener("click", () => { state.wizardStarted = true; saveState(); renderApp(); scheduleRender(); });
    document.querySelectorAll("[data-plot-type]").forEach(btn => btn.addEventListener("click", () => choosePlotType(btn.dataset.plotType)));
    document.getElementById("guessStarter")?.addEventListener("click", () => { state.mappings = { ...state.mappings, ...guessMappings(state.plotType) }; saveState(); toast("Column guesses refreshed"); });
    document.getElementById("newPlotType")?.addEventListener("click", () => { state.wizardStarted = false; saveState(); renderApp(); });
    document.getElementById("guessMappings")?.addEventListener("click", () => { state.mappings = { ...state.mappings, ...guessMappings(state.plotType) }; saveState(); renderApp(); scheduleRender(); });
    document.getElementById("pasteCsvToggle")?.addEventListener("click", () => document.getElementById("pasteCsvBox")?.classList.toggle("hidden"));
    document.getElementById("applyPastedCsv")?.addEventListener("click", () => applyCsv(document.getElementById("csvTextarea").value, "pasted_csv"));
    document.getElementById("csvUpload")?.addEventListener("change", e => readCsvFile(e.target.files && e.target.files[0]));
    document.getElementById("starterCsv")?.addEventListener("change", e => readCsvFile(e.target.files && e.target.files[0]));
    document.getElementById("renderNow")?.addEventListener("click", () => renderNow());
    document.getElementById("downloadChart")?.addEventListener("click", downloadChart);
    document.getElementById("copyCode")?.addEventListener("click", copyCode);
    document.getElementById("downloadCode")?.addEventListener("click", downloadCode);
    document.getElementById("downloadJson")?.addEventListener("click", downloadJson);
    document.getElementById("importJson")?.addEventListener("click", () => document.getElementById("importJsonFile")?.click());
    document.getElementById("importJsonStarter")?.addEventListener("click", () => document.getElementById("importJsonFile")?.click());
    document.getElementById("importJsonFile")?.addEventListener("change", importJsonFile);
    document.getElementById("addLayer")?.addEventListener("click", addLayer);
    document.getElementById("addAnnotation")?.addEventListener("click", addAnnotation);
    bindFontPickerEvents();
    bindSettingsSearchEvents();
    document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => { activeTab = btn.dataset.tab; saveState(); renderApp(); }));
    document.querySelectorAll("[data-clear-slot]").forEach(btn => btn.addEventListener("click", () => { delete state.mappings[btn.dataset.clearSlot]; persistAndMaybeRender(true); }));
    document.querySelectorAll("[data-duplicate-layer]").forEach(btn => btn.addEventListener("click", () => { const i = Number(btn.dataset.duplicateLayer); const l = deepClone(state.layers[i]); l.id = uniqueId("layer"); state.layers.splice(i + 1, 0, l); persistAndMaybeRender(true); }));
    document.querySelectorAll("[data-remove-layer]").forEach(btn => btn.addEventListener("click", () => { state.layers.splice(Number(btn.dataset.removeLayer), 1); persistAndMaybeRender(true); }));
    document.querySelectorAll("[data-remove-annotation]").forEach(btn => btn.addEventListener("click", () => { state.annotations.splice(Number(btn.dataset.removeAnnotation), 1); persistAndMaybeRender(true); }));
    document.querySelectorAll("[data-aspect]").forEach(btn => btn.addEventListener("click", () => { state.export.aspectRatio = Number(btn.dataset.aspect); applyAspect("width"); persistAndMaybeRender(true); }));
    document.querySelectorAll("[data-clear-path]").forEach(btn => btn.addEventListener("click", () => {
      setPath(state, btn.dataset.clearPath, "");
      persistAndMaybeRender(true);
    }));

    document.querySelectorAll("[data-bind]").forEach(input => {
      const handler = () => {
        const path = input.dataset.bind;
        let value = input.type === "checkbox" ? input.checked : input.value;
        if (input.dataset.type === "number" && value !== "") value = Number(value);
        setPath(state, path, value);
        enforceLinkedLimit(input);
        if (input.dataset.aspectDim) applyAspect(input.dataset.aspectDim);
        syncBoundInputs(path);
        if (input.dataset.limitMin) syncBoundInputs(input.dataset.limitMin);
        if (input.dataset.limitMax) syncBoundInputs(input.dataset.limitMax);
        if (input.dataset.aspectDim) {
          syncBoundInputs("export.widthCm");
          syncBoundInputs("export.heightCm");
          syncBoundInputs("export.widthPx");
          syncBoundInputs("export.heightPx");
        }
        if (path === "interfaceTheme") applyInterfaceTheme(value);
        if (path === "backend") {
          normaliseFontForBackend();
          refreshFontsForBackend({ quiet: false });
        }
        if (path === "theme.baseFamily") {
          ensureWebFont(value);
          input.style.fontFamily = `${cssString(value || "Inter")}, var(--sans)`;
        }
        persistAndMaybeRender(input.dataset.refresh === "true");
      };
      const eventName = input.dataset.fontFamilyInput === "true" ? "change" : (input.tagName === "SELECT" || input.type === "checkbox" || input.type === "color" ? "change" : "input");
      input.addEventListener(eventName, handler);
      if (input.dataset.fontFamilyInput === "true") input.addEventListener("blur", handler);
    });

    document.querySelectorAll("[data-color-for]").forEach(input => {
      input.addEventListener("input", () => {
        const path = input.dataset.colorFor;
        setPath(state, path, input.value);
        const text = document.querySelector(`[data-bind="${cssEscape(path)}"]`);
        if (text) text.value = input.value;
        persistAndMaybeRender(false);
      });
    });

    document.querySelectorAll("[data-column]").forEach(btn => {
      btn.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", btn.dataset.column);
        e.dataTransfer.effectAllowed = "copy";
      });
      btn.addEventListener("click", () => assignToFirstEmpty(btn.dataset.column));
    });
    document.querySelectorAll("[data-slot]").forEach(slot => {
      slot.addEventListener("dragover", e => { e.preventDefault(); slot.classList.add("dragover"); });
      slot.addEventListener("dragleave", () => slot.classList.remove("dragover"));
      slot.addEventListener("drop", e => {
        e.preventDefault(); slot.classList.remove("dragover");
        const col = e.dataTransfer.getData("text/plain");
        if (col) { state.mappings[slot.dataset.slot] = col; persistAndMaybeRender(true); }
      });
    });
    document.getElementById("columnSearch")?.addEventListener("input", e => filterColumns(e.target.value));
    bindCustomPaletteEvents();
    enableNumberWheelInputs();
    highlightFocusedSetting();
  }

  function bindCustomPaletteEvents() {
    document.querySelectorAll("[data-palette-color]").forEach(input => input.addEventListener("input", () => {
      const i = Number(input.dataset.paletteColor);
      state.palette.customColors[i] = input.value;
      const textInput = document.querySelector(`[data-palette-text="${i}"]`);
      if (textInput) textInput.value = input.value;
      persistAndMaybeRender(false);
    }));
    document.querySelectorAll("[data-palette-text]").forEach(input => input.addEventListener("change", () => {
      const i = Number(input.dataset.paletteText);
      if (!isHexColor(input.value)) {
        input.value = state.palette.customColors[i] || "#000000";
        return;
      }
      state.palette.customColors[i] = input.value;
      persistAndMaybeRender(true);
    }));
    document.querySelectorAll("[data-remove-palette-colour]").forEach(btn => btn.addEventListener("click", () => {
      if (state.palette.customColors.length <= 1) return;
      state.palette.customColors.splice(Number(btn.dataset.removePaletteColour), 1);
      persistAndMaybeRender(true);
    }));
    document.getElementById("addPaletteColour")?.addEventListener("click", () => {
      const last = state.palette.customColors[state.palette.customColors.length - 1] || "#2563EB";
      state.palette.customColors.push(last);
      persistAndMaybeRender(true);
    });
    document.getElementById("useCustomPalette")?.addEventListener("click", () => {
      state.palette.color = "custom";
      state.palette.fill = "custom";
      persistAndMaybeRender(true);
    });
  }

  function bindFontPickerEvents() {
    const search = document.getElementById("fontSearch");
    if (search) {
      search.addEventListener("input", e => {
        state.fontSearch = e.target.value;
        saveState();
        const results = document.getElementById("fontResults");
        if (results) results.innerHTML = fontResultsHtml();
        bindFontOptionEvents();
      });
    }
    bindFontOptionEvents();
  }

  function bindFontOptionEvents() {
    document.querySelectorAll("[data-font]").forEach(btn => btn.addEventListener("click", () => {
      state.theme.baseFamily = btn.dataset.font || "sans";
      ensureWebFont(state.theme.baseFamily);
      commitHistory();
      saveState();
      document.querySelectorAll('[data-bind="theme.baseFamily"]').forEach(input => {
        if (input !== document.activeElement) {
          input.value = state.theme.baseFamily;
          input.style.fontFamily = `${cssString(state.theme.baseFamily)}, var(--sans)`;
        }
      });
      const results = document.getElementById("fontResults");
      if (results) results.innerHTML = fontResultsHtml();
      bindFontOptionEvents();
      updateCodePreview();
      scheduleRender();
    }));
  }

  function bindSettingsSearchEvents() {
    const input = document.getElementById("settingsSearch");
    if (input) {
      input.addEventListener("input", e => {
        const wasSearching = Boolean(String(state.settingsSearch || "").trim());
        state.settingsSearch = e.target.value;
        saveState();
        const isSearching = Boolean(String(state.settingsSearch || "").trim());
        if (wasSearching !== isSearching) {
          renderApp();
          requestAnimationFrame(() => {
            const next = document.getElementById("settingsSearch");
            if (next) {
              next.focus();
              next.setSelectionRange(next.value.length, next.value.length);
            }
          });
        } else {
          const box = document.getElementById("settingsSearchResults");
          if (box) box.innerHTML = settingsSearchResultsHtml();
          bindSettingJumpEvents();
        }
      });
    }
    bindSettingJumpEvents();
  }

  function bindSettingJumpEvents() {
    document.querySelectorAll("[data-jump-setting]").forEach(btn => btn.addEventListener("click", () => {
      activeTab = btn.dataset.jumpTab || activeTab;
      state.focusSetting = btn.dataset.jumpSetting || "";
      state.settingsSearch = "";
      saveState();
      renderApp();
    }));
  }

  function highlightFocusedSetting() {
    const path = state.focusSetting;
    if (!path) return;
    requestAnimationFrame(() => {
      const selector = `[data-bind="${cssEscape(path)}"], [id="${cssEscape(path)}"]`;
      const el = document.querySelector(selector);
      if (!el) return;
      const box = el.closest(".field, .layer-card, .annotation-card, details") || el;
      box.classList.add("focus-pulse");
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      if (typeof el.focus === "function") el.focus({ preventScroll: true });
      setTimeout(() => box.classList.remove("focus-pulse"), 1800);
      state.focusSetting = "";
      saveState();
    });
  }

  function enableNumberWheelInputs() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener("wheel", event => {
        event.preventDefault();
        const before = input.value;
        try {
          if (event.deltaY < 0) input.stepUp();
          else input.stepDown();
        } catch (e) {
          const step = Number(input.step) || 1;
          const current = Number(input.value) || 0;
          input.value = String(current + (event.deltaY < 0 ? step : -step));
        }
        if (input.value !== before) input.dispatchEvent(new Event("input", { bubbles: true }));
      }, { passive: false });
    });
  }

  function cssEscape(x) {
    if (window.CSS && CSS.escape) return CSS.escape(x);
    return String(x).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function commitHistory() {
    const current = JSON.stringify(state);
    if (current === lastUndoSnapshot) return;
    historyPast.push(lastUndoSnapshot);
    if (historyPast.length > 100) historyPast.shift();
    historyFuture = [];
    lastUndoSnapshot = current;
  }

  function restoreSnapshot(snapshot) {
    if (!snapshot) return;
    state = mergeDeep(defaultState(), JSON.parse(snapshot));
    migrateState(state, state);
    dataset = parseCsv(state.csv || sampleCsv, state.dataName || "data");
    activeTab = state.activeTab || activeTab || "layers";
    lastUndoSnapshot = JSON.stringify(state);
    saveState();
    renderApp();
    scheduleRender();
  }

  function undoState() {
    const snapshot = historyPast.pop();
    if (!snapshot) return;
    historyFuture.push(JSON.stringify(state));
    restoreSnapshot(snapshot);
    toast("Undo");
  }

  function redoState() {
    const snapshot = historyFuture.pop();
    if (!snapshot) return;
    historyPast.push(JSON.stringify(state));
    restoreSnapshot(snapshot);
    toast("Redo");
  }

  function bindKeyboardShortcuts() {
    document.addEventListener("keydown", event => {
      const key = String(event.key || "").toLowerCase();
      const isTextInput = event.target && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName);
      if (!event.ctrlKey || event.altKey || isTextInput) return;
      if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        redoState();
        return;
      }
      if (key === "z") {
        event.preventDefault();
        undoState();
      }
    });
  }

  function syncBoundInputs(path) {
    document.querySelectorAll(`[data-bind="${cssEscape(path)}"]`).forEach(el => {
      if (el === document.activeElement) return;
      const value = getPath(state, path);
      if (el.type === "checkbox") el.checked = Boolean(value);
      else el.value = value == null ? "" : value;
    });
  }

  function enforceLinkedLimit(input) {
    if (input.dataset.limitMin) {
      const minPath = input.dataset.bind;
      const maxPath = input.dataset.limitMin;
      const lo = Number(getPath(state, minPath));
      const hi = Number(getPath(state, maxPath));
      if (Number.isFinite(lo) && Number.isFinite(hi) && lo > hi) setPath(state, maxPath, lo);
    }
    if (input.dataset.limitMax) {
      const maxPath = input.dataset.bind;
      const minPath = input.dataset.limitMax;
      const lo = Number(getPath(state, minPath));
      const hi = Number(getPath(state, maxPath));
      if (Number.isFinite(lo) && Number.isFinite(hi) && hi < lo) setPath(state, minPath, hi);
    }
  }

  function persistAndMaybeRender(refresh) {
    commitHistory();
    saveState();
    updateCodePreview();
    if (refresh) renderApp();
    scheduleRender();
  }

  function applyAspect(changedDim) {
    if (!state.export.lockAspect) return;
    const r = Math.max(0.05, Number(state.export.aspectRatio) || 1);
    if (state.export.units === "cm") {
      if (changedDim === "height") state.export.widthCm = round(state.export.heightCm * r, 2);
      else state.export.heightCm = round(state.export.widthCm / r, 2);
    } else {
      if (changedDim === "height") state.export.widthPx = Math.max(1, Math.round(state.export.heightPx * r));
      else state.export.heightPx = Math.max(1, Math.round(state.export.widthPx / r));
    }
  }

  function round(x, digits) {
    const m = Math.pow(10, digits || 0);
    return Math.round(Number(x) * m) / m;
  }

  function assignToFirstEmpty(col) {
    const slot = mappingSlots.find(([key]) => !state.mappings[key]) || mappingSlots[0];
    state.mappings[slot[0]] = col;
    persistAndMaybeRender(true);
  }

  function filterColumns(query) {
    const q = String(query || "").toLowerCase();
    document.querySelectorAll("[data-column]").forEach(btn => {
      btn.style.display = btn.dataset.column.toLowerCase().includes(q) ? "flex" : "none";
    });
  }

  function readCsvFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => applyCsv(String(reader.result || ""), file.name.replace(/\.csv$/i, ""));
    reader.readAsText(file);
  }

  function applyCsv(text, name) {
    state.csv = text;
    state.dataName = name || "uploaded_csv";
    dataset = parseCsv(text, state.dataName);
    state.mappings = { ...state.mappings, ...guessMappings(state.plotType) };
    saveState();
    renderApp();
    scheduleRender();
  }

  function addLayer() {
    const geom = document.getElementById("addLayerGeom")?.value || "point";
    state.layers.push(makeLayer(geom));
    persistAndMaybeRender(true);
  }

  function addAnnotation() {
    const type = document.getElementById("addAnnotationType")?.value || "text";
    state.annotations.push(makeAnnotation(type));
    persistAndMaybeRender(true);
  }

  async function loadLocalFonts(options) {
    const quiet = options && options.quiet !== false ? true : false;
    const bases = localBackendCandidates();
    let lastMessage = "";
    if (!quiet) setStatus("Loading local font list.");
    for (const base of bases) {
      try {
        const res = await fetch(`${base}/fonts`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(asText(json.error) || `HTTP ${res.status}`);
        const fonts = normalizeFontPayload(json.fonts);
        knownFonts = dedupe([...commonFonts.map(family => ({ family, source: "common" })), ...fonts]);
        state.localUrl = base;
        if (isLocalHttpOrigin(base)) state.backend = "local";
        saveState();
        if (!quiet) toast(`Loaded ${fonts.length} local font families`);
        renderApp();
        return;
      } catch (e) {
        lastMessage = e && e.message ? e.message : String(e);
      }
    }
    if (!quiet) toast(`Could not load local fonts${lastMessage ? `: ${lastMessage}` : "."}`);
  }

  function localBackendCandidates() {
    const vals = [state.localUrl, /^https?:/i.test(location.protocol) ? location.origin : "", "http://127.0.0.1:8787", "http://localhost:8787"].filter(Boolean);
    return Array.from(new Set(vals.map(x => String(x).replace(/\/+$/, ""))));
  }

  function setStatus(text) {
    statusMessage = text || "Ready.";
    const el = document.getElementById("statusText");
    if (el) el.textContent = statusMessage;
  }

  function toast(text) {
    const div = document.createElement("div");
    div.className = "toast";
    div.textContent = text;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2200);
  }

  function scheduleRender() {
    updateCodePreview();
    if (!state.autoRender || !state.wizardStarted) return;
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => renderNow(), RENDER_DEBOUNCE_MS);
  }

  async function renderNow() {
    if (!state.wizardStarted || isRendering) return;
    clearTimeout(renderTimer);
    lastError = "";
    isRendering = true;
    setStatus("Preparing render.");
    if (normaliseFontForBackend()) saveState();
    renderApp();
    const code = buildRCode();
    const previewCode = state.export.format === "emf" ? buildRCode("svg") : code;
    try {
      const result = state.backend === "webr" ? await renderWithWebR(code, previewCode) : await renderWithLocalR(code, previewCode);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      if (resultTiffPreviewUrl) URL.revokeObjectURL(resultTiffPreviewUrl);
      resultUrl = result.url;
      resultMime = result.mime;
      resultSvgText = result.svgText || "";
      resultTiffPreviewUrl = result.tiffPreviewUrl || "";
      resultTiffPreviewError = result.tiffPreviewError || "";
      resultPreviewNote = result.previewNote || "";
      if (resultSvgText) await waitForPreviewFont();
      lastError = "";
      statusMessage = resultTiffPreviewError ? `Rendered. TIFF preview note: ${resultTiffPreviewError}` : (resultPreviewNote ? `Rendered. ${resultPreviewNote}` : "Rendered.");
    } catch (e) {
      lastError = e && e.message ? e.message : String(e);
      statusMessage = "Render failed.";
    } finally {
      isRendering = false;
      renderApp();
      setStatus(statusMessage);
    }
  }

  async function requestLocalRender(base, code, format) {
    const res = await fetch(`${base}/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, format })
    });
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || `Local R returned HTTP ${res.status}`);
    return {
      mime: asText(json.mime) || mimeForFormat[format] || "application/octet-stream",
      bytes: base64ToBytes(asText(json.data))
    };
  }

  async function renderWithLocalR(code, previewCode) {
    const base = (state.localUrl || "http://127.0.0.1:8787").replace(/\/+$/, "");
    setStatus("Sending code to local R.");
    const actual = await requestLocalRender(base, code, state.export.format);
    const result = await prepareRenderedBytes(actual.bytes, actual.mime);
    if (state.export.format === "emf") {
      try {
        setStatus("Rendering SVG preview for EMF export.");
        const preview = await requestLocalRender(base, previewCode || buildRCode("svg"), "svg");
        const prepared = prepareSvgBytes(preview.bytes, preview.mime || "image/svg+xml");
        result.svgText = prepared.svgText || "";
        result.previewNote = result.svgText ? "SVG preview shown; downloadable EMF may differ a bit." : "SVG preview could not be generated; downloadable EMF is ready.";
      } catch (e) {
        result.previewNote = `SVG preview could not be generated; downloadable EMF is ready. ${e && e.message ? e.message : String(e)}`;
      }
    }
    return result;
  }

  async function getWebR() {
    if (webRInstance) return webRInstance;
    setStatus("Loading WebR from CDN.");
    const mod = await import(WEBR_CDN);
    const webR = new mod.WebR();
    await webR.init();
    webRInstance = webR;
    return webR;
  }

  const webRFontsRegistered = new Set();
  const webRFontsInFlight = new Map();

  function fontFileSafeName(family, suffix) {
    return `${String(family).replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "font"}_${suffix}.woff2`;
  }

  function googleFontFacesFromCss(css) {
    const faces = [];
    for (const match of css.matchAll(/@font-face\s*{([\s\S]*?)}/g)) {
      const block = match[1];
      const style = (block.match(/font-style:\s*([^;]+)/) || ["", "normal"])[1].trim();
      const weight = Number(((block.match(/font-weight:\s*(\d+)/) || ["", "400"])[1] || "400").trim());
      const url = (block.match(/url\(([^)]+)\)\s*format\(['"]?woff2['"]?\)/) || [])[1];
      const range = (block.match(/unicode-range:\s*([^;]+)/) || ["", ""])[1];
      if (url) faces.push({ style, weight, url: url.replace(/^['"]|['"]$/g, ""), latin: /U\+0000-00FF/i.test(range) });
    }
    return faces;
  }

  function pickGoogleFontFace(faces, italic, bold) {
    const style = italic ? "italic" : "normal";
    const target = bold ? 700 : 400;
    const candidates = faces.filter(f => f.style === style);
    const ranked = candidates.length ? candidates : faces;
    return ranked.slice().sort((a, b) => (b.latin - a.latin) || Math.abs(a.weight - target) - Math.abs(b.weight - target))[0];
  }

  async function ensureWebRDirectory(webR, path) {
    const parts = path.split("/").filter(Boolean);
    let current = "";
    for (const part of parts) {
      current += `/${part}`;
      try { await webR.FS.mkdir(current); } catch (e) { }
    }
  }

  async function registerGoogleFontInWebR(webR, family) {
    const fam = String(family || "").trim();
    if (!fam || !webFontFamilies.has(fam) || webRFontsRegistered.has(fam)) return;
    if (webRFontsInFlight.has(fam)) return webRFontsInFlight.get(fam);
    const task = (async () => {
      try {
        setStatus(`Loading Google font for WebR: ${fam}.`);
        const cssUrl = googleFontCssUrl(fam);
        const cssRes = await fetch(cssUrl, { cache: "force-cache" });
        if (!cssRes.ok) throw new Error(`Google Fonts CSS returned HTTP ${cssRes.status}`);
        const faces = googleFontFacesFromCss(await cssRes.text());
        if (!faces.length) throw new Error("No WOFF2 font faces found in Google Fonts CSS.");
        const chosen = {
          plain: pickGoogleFontFace(faces, false, false),
          bold: pickGoogleFontFace(faces, false, true),
          italic: pickGoogleFontFace(faces, true, false),
          bolditalic: pickGoogleFontFace(faces, true, true)
        };
        await ensureWebRDirectory(webR, "/home/web_user/fonts/rapidgg");
        const paths = {};
        for (const key of Object.keys(chosen)) {
          const face = chosen[key] || chosen.plain;
          const response = await fetch(face.url, { cache: "force-cache" });
          if (!response.ok) throw new Error(`Font file returned HTTP ${response.status}`);
          const bytes = new Uint8Array(await response.arrayBuffer());
          const path = `/home/web_user/fonts/rapidgg/${fontFileSafeName(fam, key)}`;
          await webR.FS.writeFile(path, bytes);
          paths[key] = path;
        }
        const registerCode = `if (requireNamespace('systemfonts', quietly = TRUE)) systemfonts::register_font(name = ${rString(fam)}, plain = ${rString(paths.plain)}, bold = ${rString(paths.bold)}, italic = ${rString(paths.italic)}, bolditalic = ${rString(paths.bolditalic)})`;
        await webR.evalRVoid(registerCode);
        webRFontsRegistered.add(fam);
      } catch (e) {
        console.warn("RapidGG WebR font registration failed", e);
      } finally {
        webRFontsInFlight.delete(fam);
      }
    })();
    webRFontsInFlight.set(fam, task);
    return task;
  }

  async function renderWithWebR(code, previewCode) {
    const webR = await getWebR();

    const webRRenderFormat = async (codeForFormat, format, status) => {
      const pkgs = requiredPackages(format).filter(p => !webRInstalled.has(p));
      if (pkgs.length) {
        setStatus(`Installing WebR packages: ${pkgs.join(", ")}.`);
        const key = pkgs.join("|");
        if (!webRInstalling.has(key)) {
          webRInstalling.add(key);
          await webR.installPackages(pkgs);
          pkgs.forEach(p => webRInstalled.add(p));
          webRInstalling.delete(key);
        }
      }
      const outDir = "/tmp/rapidgg";
      const outPath = `${outDir}/plot.${format}`;
      try { await webR.FS.mkdir(outDir); } catch (e) { }
      try { await webR.FS.unlink(outPath); } catch (e) { }
      const fam = previewFontFamily();
      ensureWebFont(fam);
      await webR.evalRVoid(`Sys.setenv(RAPIDGG_OUTPUT = ${rString(outPath)}, RAPIDGG_BACKEND = 'webr', RAPIDGG_WEB_FONT_CSS = ${rString(googleFontCssUrl(fam))})`);
      setStatus(status || "Rendering chart with WebR.");
      await webR.evalRVoid(codeForFormat);
      return {
        bytes: await webR.FS.readFile(outPath),
        mime: mimeForFormat[format] || "application/octet-stream"
      };
    };

    const actual = await webRRenderFormat(code, state.export.format, "Rendering chart with WebR.");
    const result = await prepareRenderedBytes(actual.bytes, actual.mime);
    if (state.export.format === "emf") {
      try {
        const preview = await webRRenderFormat(previewCode || buildRCode("svg"), "svg", "Rendering SVG preview for EMF export with WebR.");
        const prepared = prepareSvgBytes(preview.bytes, preview.mime || "image/svg+xml");
        result.svgText = prepared.svgText || "";
        result.previewNote = result.svgText ? "SVG preview shown; downloadable EMF may differ a bit." : "SVG preview could not be generated; downloadable EMF is ready.";
      } catch (e) {
        result.previewNote = `SVG preview could not be generated; downloadable EMF is ready. ${e && e.message ? e.message : String(e)}`;
      }
    }
    return result;
  }

  function asText(value) {
    if (Array.isArray(value)) return value.length ? asText(value[0]) : "";
    if (value == null) return "";
    return String(value);
  }

  function base64ToBytes(base64) {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  async function prepareRenderedBytes(bytes, mime) {
    const prepared = prepareSvgBytes(bytes, mime);
    const out = {
      url: URL.createObjectURL(new Blob([prepared.bytes], { type: mime })),
      mime,
      svgText: prepared.svgText || "",
      tiffPreviewUrl: "",
      tiffPreviewError: "",
      previewNote: ""
    };
    if (asText(mime) === "image/tiff") {
      const preview = await tiffPreviewFromBytes(bytes);
      out.tiffPreviewUrl = preview.url || "";
      out.tiffPreviewError = preview.error || "";
    }
    return out;
  }

  function bytesToUrl(bytes, mime) {
    const prepared = prepareSvgBytes(bytes, mime);
    return URL.createObjectURL(new Blob([prepared.bytes], { type: mime }));
  }

  async function loadUtif() {
    if (window.UTIF) return window.UTIF;
    if (utifLoadPromise) return utifLoadPromise;
    utifLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = UTIF_CDN;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => window.UTIF ? resolve(window.UTIF) : reject(new Error("UTIF.js loaded, but UTIF was not found on window."));
      script.onerror = () => reject(new Error("Could not load UTIF.js for TIFF preview."));
      document.head.appendChild(script);
    });
    return utifLoadPromise;
  }

  async function tiffPreviewFromBytes(bytes) {
    try {
      const UTIF = await loadUtif();
      const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      const ifds = UTIF.decode(buffer);
      if (!ifds || !ifds.length) throw new Error("No TIFF image directory found.");
      UTIF.decodeImage(buffer, ifds[0]);
      const width = Number(ifds[0].width || ifds[0].t256 && ifds[0].t256[0]);
      const height = Number(ifds[0].height || ifds[0].t257 && ifds[0].t257[0]);
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error("TIFF dimensions could not be read.");
      const rgba = UTIF.toRGBA8(ifds[0]);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.byteLength), width, height), 0, 0);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Canvas could not create a PNG preview.");
      return { url: URL.createObjectURL(blob), error: "" };
    } catch (e) {
      return { url: "", error: e && e.message ? e.message : String(e) };
    }
  }


  function prepareSvgBytes(bytes, mime) {
    if (asText(mime) !== "image/svg+xml") return { bytes, svgText: "" };
    try {
      const decoder = new TextDecoder("utf-8");
      const encoder = new TextEncoder();
      const svg = decoder.decode(bytes);
      if (!/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(svg)) return { bytes, svgText: "" };
      const patched = patchSvgForBrowserFonts(svg);
      return { bytes: encoder.encode(patched), svgText: patched };
    } catch (e) {
      return { bytes, svgText: "" };
    }
  }

  function previewFontFamily() {
    const fam = String(state.theme.baseFamily || "").trim();
    if (!fam || fam === "sans") return "Inter";
    if (fam === "serif") return "Merriweather";
    if (fam === "mono") return "Roboto Mono";
    return fam;
  }

  function patchSvgForBrowserFonts(svg) {
    const fam = previewFontFamily();
    ensureWebFont(fam);
    const cssFamily = fam.replace(/[\'\\]/g, "").trim() || "Inter";
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, "image/svg+xml");
      if (doc.querySelector("parsererror")) throw new Error("SVG parser rejected the rendered output.");
      const root = doc.documentElement;
      root.querySelectorAll("[textLength]").forEach(el => el.removeAttribute("textLength"));
      root.querySelectorAll("[lengthAdjust]").forEach(el => el.removeAttribute("lengthAdjust"));
      root.querySelectorAll("text,tspan").forEach(el => {
        el.setAttribute("font-family", cssFamily);
        const current = el.getAttribute("style") || "";
        const kept = current.split(";").map(x => x.trim()).filter(x => x && !/^font-family\s*:/i.test(x) && !/^font-stretch\s*:/i.test(x));
        kept.push(`font-family: ${cssString(cssFamily)}`);
        kept.push("font-stretch: normal");
        el.setAttribute("style", kept.join("; "));
      });
      if (!root.querySelector("style[data-rapidgg-webfont]")) {
        let defs = root.querySelector("defs");
        if (!defs) {
          defs = doc.createElementNS(SVG_NS, "defs");
          root.insertBefore(defs, root.firstChild);
        }
        const style = doc.createElementNS(SVG_NS, "style");
        style.setAttribute("data-rapidgg-webfont", cssFamily);
        style.setAttribute("type", "text/css");
        style.textContent = `@import url("${googleFontCssUrl(cssFamily)}"); text, tspan { font-family: ${cssString(cssFamily)}, Arial, sans-serif !important; font-stretch: normal !important; font-synthesis: none; }`;
        defs.insertBefore(style, defs.firstChild);
      }
      return new XMLSerializer().serializeToString(doc);
    } catch (e) {
      console.warn("RapidGG SVG font patch failed; returning original SVG.", e);
      return svg;
    }
  }

  async function waitForPreviewFont() {
    const fam = previewFontFamily();
    ensureWebFont(fam);
    if (!document.fonts || !document.fonts.load) return;
    try {
      await Promise.race([
        Promise.all([document.fonts.load(`12px ${cssString(fam)}`), document.fonts.load(`bold 12px ${cssString(fam)}`), document.fonts.ready]),
        new Promise(resolve => setTimeout(resolve, 1600))
      ]);
    } catch (e) { }
  }

  function downloadChart() {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `rapidgg-plot.${state.export.format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function copyCode() {
    navigator.clipboard.writeText(buildRCode()).then(() => toast("R code copied"));
  }

  function downloadCode() {
    downloadText("rapidgg-plot.R", buildRCode(), "text/x-r;charset=utf-8");
  }

  function downloadJson() {
    downloadText("rapidgg-state.json", stateToJson(), "application/json;charset=utf-8");
  }

  function downloadText(filename, text, mime) {
    const url = URL.createObjectURL(new Blob([text], { type: mime || "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function promptMagicImport() {
    const text = window.prompt("Paste a RapidGG magic state string from the generated R code:");
    if (text == null) return;
    importMagicString(text);
  }

  function importMagicString(text) {
    try {
      const imported = magicToState(text);
      state = mergeDeep(defaultState(), imported);
      migrateState(state, state);
      dataset = parseCsv(state.csv || sampleCsv, state.dataName || "magic_state");
      activeTab = state.activeTab || "layers";
      saveState();
      refreshFontsForBackend({ quiet: true });
      renderApp();
      scheduleRender();
      toast("Magic state restored");
    } catch (err) {
      window.alert(`Could not restore magic state: ${err.message || err}`);
    }
  }

  function importJsonFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = jsonToState(String(reader.result || ""));
        state = mergeDeep(defaultState(), imported);
        dataset = parseCsv(state.csv || sampleCsv, state.dataName || "imported");
        activeTab = state.activeTab || "layers";
        saveState();
        refreshFontsForBackend({ quiet: true });
        renderApp();
        scheduleRender();
        toast("JSON state imported");
      } catch (err) {
        window.alert(`Could not import JSON state: ${err.message || err}`);
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function stateToJson() {
    const copy = deepClone(state);
    copy.version = 14;
    copy.createdUtc = new Date().toISOString();
    return JSON.stringify(copy, null, 2) + "\n";
  }

  function jsonToState(text) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("The file does not contain a RapidGG state object.");
    return parsed.state && typeof parsed.state === "object" ? parsed.state : parsed;
  }


  function stateMagicString() {
    const copy = deepClone(state);
    copy.version = 14;
    copy.createdUtc = new Date().toISOString();
    const bytes = new TextEncoder().encode(JSON.stringify(copy));
    const codes = lzwCompressBytes(bytes);
    const packed = new Uint8Array(codes.length * 2);
    codes.forEach((code, i) => {
      packed[i * 2] = (code >>> 8) & 255;
      packed[i * 2 + 1] = code & 255;
    });
    return "RGW1:" + bytesToBase64Url(packed);
  }

  function magicToState(text) {
    const raw = String(text || "").trim().replace(/^#\s*/, "");
    const match = raw.match(/(?:RapidGG\s+magic\s+state\s*:\s*)?(RGW1:[A-Za-z0-9_-]+)/i);
    if (!match) throw new Error("No RGW1 magic state string was found.");
    const packed = base64UrlToBytes(match[1].slice(5));
    if (packed.length % 2) throw new Error("The magic string is truncated.");
    const codes = [];
    for (let i = 0; i < packed.length; i += 2) codes.push((packed[i] << 8) | packed[i + 1]);
    const bytes = lzwDecompressBytes(codes);
    return jsonToState(new TextDecoder().decode(bytes));
  }

  function lzwCompressBytes(bytes) {
    const dict = new Map();
    for (let i = 0; i < 256; i++) dict.set(String.fromCharCode(i), i);
    let phrase = "";
    const out = [];
    let code = 256;
    for (const byte of bytes) {
      const ch = String.fromCharCode(byte);
      const next = phrase + ch;
      if (dict.has(next)) {
        phrase = next;
      } else {
        if (phrase) out.push(dict.get(phrase));
        if (code < 65535) dict.set(next, code++);
        phrase = ch;
      }
    }
    if (phrase) out.push(dict.get(phrase));
    return out;
  }

  function lzwDecompressBytes(codes) {
    if (!codes.length) return new Uint8Array();
    const dict = new Map();
    for (let i = 0; i < 256; i++) dict.set(i, String.fromCharCode(i));
    let old = codes[0];
    let phrase = dict.get(old);
    const out = phrase.split("").map(ch => ch.charCodeAt(0));
    let code = 256;
    for (let i = 1; i < codes.length; i++) {
      const curr = codes[i];
      let entry = dict.has(curr) ? dict.get(curr) : phrase + phrase[0];
      for (let j = 0; j < entry.length; j++) out.push(entry.charCodeAt(j));
      if (code < 65535) dict.set(code++, phrase + entry[0]);
      phrase = entry;
    }
    return new Uint8Array(out);
  }

  function bytesToBase64Url(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64UrlToBytes(text) {
    let base64 = String(text || "").replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    return base64ToBytes(base64);
  }

  function updateCodePreview() {
    const code = buildRCode();
    const pre = document.getElementById("codePreview");
    if (pre) pre.innerHTML = highlightR(code);
  }

  function highlightR(code) {
    return code.split("\n").map(line => {
      const idx = findComment(line);
      const before = idx >= 0 ? line.slice(0, idx) : line;
      const comment = idx >= 0 ? line.slice(idx) : "";
      let html = escapeHtml(before);
      html = html.replace(/(&quot;[^&]*(?:&(?!quot;)[^&]*)*&quot;|'[^']*')/g, '<span class="str">$1</span>');
      html = html.replace(/\b(function|library|if|else|for|in|return|TRUE|FALSE|NULL|NA|Inf|ggplot|aes|theme|element_text|element_blank|labs|ggsave)\b/g, '<span class="kw">$1</span>');
      html = html.replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>');
      if (comment) html += `<span class="comment">${escapeHtml(comment)}</span>`;
      return html;
    }).join("\n");
  }

  function findComment(line) {
    let sq = false, dq = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const prev = line[i - 1];
      if (ch === "'" && !dq && prev !== "\\") sq = !sq;
      if (ch === '"' && !sq && prev !== "\\") dq = !dq;
      if (ch === "#" && !sq && !dq) return i;
    }
    return -1;
  }

  function requestedRFamily() {
    normaliseFontForBackend();
    return String(state.theme.baseFamily || (state.backend === "webr" ? "Inter" : "sans")).trim() || "sans";
  }

  function buildRCode(formatOverride) {
    const pkgs = requiredPackages(formatOverride);
    const pkgLines = pkgs.map(pkg => `library(${pkg})`);
    const magic = stateMagicString();
    const enabledLayers = state.layers.filter(l => l.enabled);
    const layers = enabledLayers.map(layerCode);
    if (!layers.length) layers.push("geom_point()  # default layer added because no layer is enabled");
    const factors = factorColumns();
    const dateCols = dataset.columns.filter(c => c.type === "date").map(c => c.name);
    const usesFilledContours = enabledLayers.some(l => l.geom === "contour_filled");
    const lines = [
      "# RapidGG Wizard generated script",
      "# Re-run this file to recreate the chart exactly, including the embedded data and settings.",
      "# The output file can be overridden with Sys.setenv(RAPIDGG_OUTPUT = 'path/to/file.svg').",
      `# RapidGG magic state: ${magic}`,
      "# Paste the magic state string into the app to restore this wizard state without a JSON file.",
      "",
      ...pkgLines,
      "",
      "`%||%` <- function(x, y) if (is.null(x) || length(x) == 0 || (length(x) == 1 && is.na(x))) y else x",
      "",
      ...rPaletteDefinitionLines(),
      "",
      "# Font handling. Local R uses systemfonts when available; WebR attempts to fetch Google Fonts through systemfonts when a web font is selected.",
      ".rapid_backend <- Sys.getenv('RAPIDGG_BACKEND', unset = '')",
      `.rapid_requested_family <- ${rString(requestedRFamily())}`,
      "rapid_font_spec <- function(row) {",
      "  path <- as.character(row$path[1])",
      "  idx <- if ('index' %in% names(row)) suppressWarnings(as.integer(row$index[1])) else 0L",
      "  if (!nzchar(path) || !file.exists(path)) return(NA_character_)",
      "  if (!is.na(idx) && idx != 0L) list(path, idx) else path",
      "}",
      "rapid_resolve_family <- function(family) {",
      "  family <- trimws(as.character(family %||% 'sans')[1])",
      "  if (!nzchar(family)) return('sans')",
      "  if (family %in% c('sans', 'serif', 'mono')) return(family)",
      "  if (!requireNamespace('systemfonts', quietly = TRUE)) {",
      "    message('RapidGG: package systemfonts is unavailable, using sans instead of ', family)",
      "    return('sans')",
      "  }",
      "  if (identical(.rapid_backend, 'webr')) {",
      "    try(systemfonts::require_font(family, fallback = 'sans', dir = file.path(tempdir(), 'rapidgg-fonts'), error = FALSE, verbose = FALSE), silent = TRUE)",
      "    try(systemfonts::scan_local_fonts(file.path(tempdir(), 'rapidgg-fonts')), silent = TRUE)",
      "  }",
      "  fonts <- tryCatch(systemfonts::match_fonts(rep(family, 4), italic = c(FALSE, FALSE, TRUE, TRUE), weight = c('normal', 'bold', 'normal', 'bold')), error = function(e) e)",
      "  if (inherits(fonts, 'error') || is.null(fonts) || !NROW(fonts) || !'path' %in% names(fonts) || !any(file.exists(fonts$path))) {",
      "    message('RapidGG: could not match font family, using sans: ', family)",
      "    return('sans')",
      "  }",
      "  if (NROW(fonts) < 4) fonts <- fonts[rep(seq_len(NROW(fonts)), length.out = 4), , drop = FALSE]",
      "  specs <- lapply(seq_len(4), function(i) rapid_font_spec(fonts[i, , drop = FALSE]))",
      "  ok <- vapply(specs, function(x) !all(is.na(x)), logical(1))",
      "  if (!any(ok)) return('sans')",
      "  specs <- lapply(specs, function(x) if (all(is.na(x))) specs[[which(ok)[1]]] else x)",
      "  alias <- 'RapidGGSelectedFont'",
      "  .rapid_font_files <<- list(plain = fonts$path[1], bold = fonts$path[2], italic = fonts$path[3], bolditalic = fonts$path[4])",
      "  tryCatch({",
      "    systemfonts::register_font(name = alias, plain = specs[[1]], bold = specs[[2]], italic = specs[[3]], bolditalic = specs[[4]])",
      "    alias",
      "  }, error = function(e) {",
      "    message('RapidGG: font registration failed for ', family, ': ', conditionMessage(e))",
      "    'sans'",
      "  })",
      "}",
      ".rapid_font_files <- NULL",
      ".base_family <- rapid_resolve_family(.rapid_requested_family)",
      ".rapid_web_font_css <- Sys.getenv('RAPIDGG_WEB_FONT_CSS', unset = '')",
      "",
      "rapid_theme_from_function <- function(fun, base_family = 'sans', base_size = 12) {",
      "  out <- tryCatch(fun(base_family = base_family, base_size = base_size), error = function(e) NULL)",
      "  if (is.null(out)) out <- tryCatch(fun(base_size = base_size), error = function(e) NULL)",
      "  if (is.null(out)) out <- tryCatch(fun(), error = function(e) ggplot2::theme_minimal())",
      "  out + theme(text = element_text(family = base_family, size = base_size))",
      "}",
      "",
      "# Clean RapidGG default theme. Later theme() calls below remain fully editable.",
      "theme_rapid <- function(base_family = 'sans', base_size = 12) {",
      "  theme_minimal(base_family = base_family, base_size = base_size) +",
      "    theme(",
      "      text = element_text(family = base_family),",
      "      plot.title.position = 'plot',",
      "      plot.caption.position = 'plot',",
      "      legend.title = element_text(face = 'bold', family = base_family),",
      "      axis.title = element_text(face = 'bold', family = base_family),",
      "      strip.text = element_text(face = 'bold', family = base_family),",
      "      legend.background = element_rect(fill = NA, colour = NA),",
      "      plot.margin = margin(12, 16, 12, 12)",
      "    )",
      "}",
      "",
      "# Data embedded as CSV text for reproducibility.",
      `.csv_text <- ${rString(state.csv || dataset.csv || "")}`,
      "plot_data <- utils::read.csv(text = .csv_text, check.names = FALSE, stringsAsFactors = FALSE)",
      "plot_data[] <- lapply(plot_data, function(x) type.convert(x, as.is = TRUE))"
    ];
    if (dateCols.length || factors.length) {
      lines.push("", "# Restore column classes inferred by the wizard.");
      dateCols.forEach(col => lines.push(`plot_data[[${rString(col)}]] <- as.Date(plot_data[[${rString(col)}]])`));
      factors.forEach(col => lines.push(`plot_data[[${rString(col)}]] <- factor(plot_data[[${rString(col)}]])`));
    }
    if (usesFilledContours) {
      lines.push(
        "",
        "# Helper for filled contour gallery/layers on irregular x-y observations.",
        "rapid_density_surface <- function(data, x_col, y_col, n = 70) {",
        "  x <- suppressWarnings(as.numeric(data[[x_col]]))",
        "  y <- suppressWarnings(as.numeric(data[[y_col]]))",
        "  ok <- is.finite(x) & is.finite(y)",
        "  if (sum(ok) < 3 || length(unique(x[ok])) < 2 || length(unique(y[ok])) < 2) return(data.frame(x = numeric(), y = numeric(), z = numeric()))",
        "  d <- MASS::kde2d(x[ok], y[ok], n = n)",
        "  out <- expand.grid(x = d$x, y = d$y)",
        "  out$z <- as.vector(d$z)",
        "  out",
        "}"
      );
    }
    if (state.advanced.afterDataCode.trim()) lines.push("", "# User code after data loading.", ...cleanLines(state.advanced.afterDataCode));
    if (state.advanced.beforePlotCode.trim()) lines.push("", "# User setup code before building the plot.", ...cleanLines(state.advanced.beforePlotCode));
    lines.push("", "# Core plot. Drag-and-drop aesthetic mappings become aes() entries here.", `p <- ggplot(plot_data, ${baseAes()}) +`);
    layers.forEach((layer, idx) => lines.push(`  ${layer}${idx === layers.length - 1 ? "" : " +"}`));
    const themeAdditions = [themeBase()];
    if (!state.theme.presetOverride) themeAdditions.push(themeOverride());
    const additions = [labelsCode(), ...scaleLines(), ...themeAdditions, legendCode(), ...annotationCode()];
    const facet = facetCode();
    const coord = coordCode();
    if (facet) additions.push(facet);
    if (coord) additions.push(coord);
    lines.push("", "# Labels, scales, themes, legend, annotations, facets, and coordinates.");
    additions.filter(Boolean).forEach(add => lines.push(`p <- p + ${add}`));
    if (state.advanced.extraLayersCode.trim()) lines.push("", "# User-added ggplot layers.", `p <- p + ${asAddition(state.advanced.extraLayersCode)}`);
    if (state.advanced.scaleOverridesCode.trim()) lines.push("", "# User-added scale override. Later scales replace earlier scales where they overlap.", `p <- p + ${asAddition(state.advanced.scaleOverridesCode)}`);
    if (state.advanced.themeOverridesCode.trim()) lines.push("", "# User-added theme override. Later theme settings replace earlier settings.", `p <- p + ${asAddition(state.advanced.themeOverridesCode)}`);
    if (state.advanced.afterPlotCode.trim()) lines.push("", "# User code after plot construction.", ...cleanLines(state.advanced.afterPlotCode));
    lines.push(
      "",
      "# Export. Centimeters, pixels, DPI, background, and file format are controlled by the wizard.",
      `.output_file <- Sys.getenv("RAPIDGG_OUTPUT", unset = ${rString(`rapidgg-plot.${formatOverride || state.export.format}`)})`,
      ".format <- tolower(tools::file_ext(.output_file))",
      ".raster_ppi <- max(36, as.numeric(" + String(Math.round(num(state.export.dpi, 300))) + "))",
      "rapid_svg_device <- function(filename, ...) {",
      "  if (nzchar(.rapid_web_font_css)) {",
      "    svglite::svglite(filename = filename, ..., fix_text_size = FALSE, web_fonts = list(.rapid_web_font_css))",
      "  } else {",
      "    svglite::svglite(filename = filename, ..., fix_text_size = FALSE)",
      "  }",
      "}",
      "rapid_pdf_device <- function(filename, ...) {",
      "  if (capabilities('cairo')) grDevices::cairo_pdf(filename = filename, ..., family = if (.rapid_requested_family %in% c('sans', 'serif', 'mono')) .rapid_requested_family else .rapid_requested_family)",
      "  else grDevices::pdf(file = filename, ..., family = if (.rapid_requested_family %in% c('sans', 'serif', 'mono')) .rapid_requested_family else 'Helvetica')",
      "}",
      "rapid_emf_device <- function(filename, width, height, bg, ...) {",
      "  if (!requireNamespace('devEMF', quietly = TRUE)) stop('EMF export requires the devEMF package. Install it with install.packages(\"devEMF\").', call. = FALSE)",
      "  devEMF::emf(file = filename, width = width, height = height, units = 'in', bg = bg %||% 'transparent', family = if (.rapid_requested_family %in% c('sans', 'serif', 'mono')) 'Helvetica' else .rapid_requested_family, coordDPI = .raster_ppi, emfPlus = FALSE)",
      "}",
      "rapid_enable_showtext <- function() {",
      "  if (!.format %in% c('pdf')) return(FALSE)",
      "  if (!requireNamespace('showtext', quietly = TRUE) || !requireNamespace('sysfonts', quietly = TRUE)) return(FALSE)",
      "  if (is.null(.rapid_font_files) || !length(.rapid_font_files)) return(FALSE)",
      "  tryCatch({",
      "    sysfonts::font_add(.base_family, regular = .rapid_font_files$plain, bold = .rapid_font_files$bold, italic = .rapid_font_files$italic, bolditalic = .rapid_font_files$bolditalic)",
      "    showtext::showtext_opts(dpi = .raster_ppi)",
      "    showtext::showtext_auto(TRUE)",
      "    TRUE",
      "  }, error = function(e) FALSE)",
      "}",
      ".rapid_showtext_on <- rapid_enable_showtext()",
      ".device <- switch(.format,",
      "  svg = if (requireNamespace('svglite', quietly = TRUE)) rapid_svg_device else 'svg',",
      "  png = if (requireNamespace('ragg', quietly = TRUE)) ragg::agg_png else 'png',",
      "  jpg = if (requireNamespace('ragg', quietly = TRUE)) ragg::agg_jpeg else 'jpeg',",
      "  jpeg = if (requireNamespace('ragg', quietly = TRUE)) ragg::agg_jpeg else 'jpeg',",
      "  tiff = if (requireNamespace('ragg', quietly = TRUE)) ragg::agg_tiff else 'tiff',",
      "  pdf = rapid_pdf_device,",
      "  emf = rapid_emf_device,",
      "  .format",
      ")",
      "ggsave(",
      "  filename = .output_file,",
      "  plot = p,",
      "  device = .device,",
      `  width = ${exportWidth()}, height = ${exportHeight()}, units = ${rString(state.export.units)},`,
      `  dpi = .raster_ppi, bg = ${rString(String(state.export.bg || "").trim() || "transparent")}, limitsize = FALSE`,
      ")",
      "if (isTRUE(.rapid_showtext_on)) showtext::showtext_auto(FALSE)",
      "",
      "if (interactive()) print(p)",
      "invisible(p)"
    );
    return `${lines.join("\n")}\n`;
  }

  function rPaletteDefinitionLines() {
    const defs = palettes.filter(pal => pal.id !== "none").map(pal => pal.id === "custom" ? { ...pal, colors: paletteColorsFor("custom") } : pal);
    const lines = ["# Palettes used by the wizard. Discrete scales use a palette function, so high-cardinality examples cannot run out of colours.", "rapid_palette_values <- list("];
    defs.forEach((pal, i) => {
      const values = (pal.colors && pal.colors.length ? pal.colors : palettes[0].colors).map(c => rString(c)).join(", ");
      lines.push(`  ${pal.id} = c(${values})${i === defs.length - 1 ? "" : ","}`);
    });
    lines.push(
      ")",
      "rapid_palette_values <- lapply(rapid_palette_values, function(x) stats::na.omit(unique(x)))",
      "rapid_palette <- function(name) {",
      "  vals <- rapid_palette_values[[name]]",
      "  if (is.null(vals) || !length(vals)) vals <- rapid_palette_values[['okabe_ito']]",
      "  vals",
      "}",
      "rapid_gradient <- function(name, reverse = FALSE) {",
      "  vals <- rapid_palette(name)",
      "  if (isTRUE(reverse)) vals <- rev(vals)",
      "  vals",
      "}",
      "rapid_discrete <- function(name, n, reverse = FALSE) {",
      "  vals <- rapid_gradient(name, reverse = reverse)",
      "  n <- max(1L, as.integer(n))",
      "  if (n <= length(vals)) vals[seq_len(n)] else grDevices::colorRampPalette(vals)(n)",
      "}",
      "rapid_discrete_scale <- function(aesthetic, name, reverse = FALSE) {",
      "  ggplot2::discrete_scale(aesthetics = aesthetic, scale_name = paste0('rapid_', name), palette = function(n) rapid_discrete(name, n, reverse = reverse))",
      "}"
    );
    return lines;
  }

  function requiredPackages(formatOverride) {
    const exportFormat = formatOverride || state.export.format;
    const set = new Set(["ggplot2", "scales"]);
    const geoms = state.layers.filter(l => l.enabled).map(l => l.geom);
    if (geoms.some(g => g.includes("repel"))) set.add("ggrepel");
    if (geoms.includes("richtext") || anyMarkdown()) set.add("ggtext");
    if (anyEquation()) set.add("latex2exp");
    const ggthemesPresets = new Set(["economist", "tufte", "few", "fivethirtyeight", "stata", "wsj", "solarized", "pander", "calc", "hc", "excel"]);
    if (ggthemesPresets.has(state.theme.preset)) set.add("ggthemes");
    if (geoms.includes("ridgeline")) set.add("ggridges");
    if (geoms.includes("quasirandom")) set.add("ggbeeswarm");
    if (geoms.includes("hex")) set.add("hexbin");
    if (geoms.includes("contour_filled")) set.add("MASS");
    if (exportFormat === "svg") set.add("svglite");
    if (["png", "jpg", "jpeg", "tiff"].includes(exportFormat)) set.add("ragg");
    if (exportFormat === "emf") set.add("devEMF");
    if (exportFormat === "pdf" && String(state.theme.baseFamily || "").trim() && !["sans", "serif", "mono"].includes(String(state.theme.baseFamily || "").trim())) { set.add("showtext"); set.add("sysfonts"); }
    if (String(state.theme.baseFamily || "").trim() && !["sans", "serif", "mono"].includes(String(state.theme.baseFamily || "").trim())) set.add("systemfonts");
    splitPackages(state.advanced.extraPackages).forEach(p => set.add(p));
    return Array.from(set);
  }

  function anyMarkdown() {
    return [state.labels.titleMode, state.labels.subtitleMode, state.labels.captionMode, state.labels.axisMode, state.labels.legendMode].includes("markdown") || state.annotations.some(a => a.mode === "markdown" || a.type === "richtext") || state.layers.some(l => l.geom === "richtext");
  }

  function anyEquation() {
    return [state.labels.titleMode, state.labels.subtitleMode, state.labels.captionMode, state.labels.axisMode].includes("equation") || state.annotations.some(a => a.mode === "equation");
  }

  function factorColumns() {
    const candidates = [state.mappings.color, state.mappings.fill, state.mappings.shape, state.mappings.group, state.mappings.facetRow, state.mappings.facetCol, state.facet.wrapBy].filter(Boolean);
    return Array.from(new Set(candidates.filter(c => shouldUseDiscrete(column(c)))));
  }

  function shouldUseDiscrete(info) {
    if (!info) return false;
    if (info.type === "categorical" || info.type === "logical") return true;
    if (info.type === "integer" && info.distinct <= 12) return true;
    return false;
  }

  function isNumericCol(name) {
    const c = column(name);
    return c && (c.type === "numeric" || c.type === "integer");
  }

  function baseAes() {
    const map = [
      ["x", state.mappings.x], ["y", state.mappings.y], ["ymin", state.mappings.ymin], ["ymax", state.mappings.ymax], ["xend", state.mappings.xend], ["yend", state.mappings.yend],
      ["colour", state.mappings.color], ["fill", state.mappings.fill], ["size", state.mappings.size], ["alpha", state.mappings.alpha], ["shape", state.mappings.shape], ["group", state.mappings.group]
    ];
    const args = map.filter(([, v]) => v).map(([aes, col]) => `${aes} = ${rName(col)}`);
    return args.length ? `aes(${args.join(", ")})` : "aes()";
  }

  function xOnlyMapping() {
    const args = [];
    if (state.mappings.x) args.push(`x = ${rName(state.mappings.x)}`);
    if (state.mappings.color) args.push(`colour = ${rName(state.mappings.color)}`);
    if (state.mappings.fill) args.push(`fill = ${rName(state.mappings.fill)}`);
    if (state.mappings.group) args.push(`group = ${rName(state.mappings.group)}`);
    return `mapping = aes(${args.join(", ")})`;
  }

  function intervalMapping(requireY) {
    if (state.mappings.ymin && state.mappings.ymax) return "";
    if (!state.mappings.y) return "";
    const parts = [`ymin = ${rName(state.mappings.y)}`, `ymax = ${rName(state.mappings.y)}`];
    if (requireY) parts.unshift(`y = ${rName(state.mappings.y)}`);
    return `mapping = aes(${parts.join(", ")})`;
  }

  function ribbonMapping() {
    if (state.mappings.ymin && state.mappings.ymax) return "";
    if (!state.mappings.y) return "";
    return `mapping = aes(ymin = 0, ymax = ${rName(state.mappings.y)})`;
  }

  function segmentFallbackMapping() {
    if (state.mappings.xend && state.mappings.yend) return "";
    if (!state.mappings.x || !state.mappings.y) return "";
    return `mapping = aes(xend = ${rName(state.mappings.x)}, yend = ${rName(state.mappings.y)})`;
  }

  function mapped(aesthetic) {
    return Boolean(state.mappings && state.mappings[aesthetic]);
  }

  function staticPointArgs(layer) {
    return joinArgs([
      mapped("alpha") ? "" : `alpha = ${Number(num(layer.alpha, 0.9).toFixed(3))}`,
      mapped("size") ? "" : `size = ${Number(num(layer.size, 2.4).toFixed(3))}`,
      colourArg("colour", layer.color),
      colourArg("fill", layer.fill),
      layer.customParams
    ]);
  }

  function staticLineArgs(layer) {
    return joinArgs([
      mapped("alpha") ? "" : `alpha = ${Number(num(layer.alpha, 0.9).toFixed(3))}`,
      mapped("size") ? "" : `linewidth = ${Number(num(layer.linewidth, 0.6).toFixed(3))}`,
      colourArg("colour", layer.color),
      colourArg("fill", layer.fill),
      layer.customParams
    ]);
  }

  function hasLayerGeom(geom) {
    return state.layers.filter(l => l.enabled).some(l => l.geom === geom);
  }

  function layerCode(layer) {
    const pos = layer.position && layer.position !== "identity" ? `position = ${rString(layer.position)}` : "";
    const commonPoint = staticPointArgs(layer);
    const commonLine = staticLineArgs(layer);
    const textArgs = joinArgs([commonPoint, "family = .base_family"]);
    const textLineArgs = joinArgs([commonLine, "family = .base_family"]);
    const labelMapping = state.mappings.label ? `mapping = aes(label = ${rName(state.mappings.label)})` : "";
    const nudge = joinArgs([layer.labelNudgeX ? `nudge_x = ${layer.labelNudgeX}` : "", layer.labelNudgeY ? `nudge_y = ${layer.labelNudgeY}` : ""]);
    switch (layer.geom) {
      case "point": return `geom_point(${commonPoint})`;
      case "line": return `geom_line(${commonLine})`;
      case "step": return `geom_step(${commonLine})`;
      case "col": return `geom_col(${joinArgs([pos, commonLine])})`;
      case "bar": return state.mappings.y ? `geom_col(${joinArgs([pos, commonLine])})` : `geom_bar(${joinArgs([pos, commonLine])})`;
      case "histogram": return `geom_histogram(${joinArgs([xOnlyMapping(), "inherit.aes = FALSE", `bins = ${Math.max(1, Math.round(num(layer.bins, 30)))}`, layer.binwidth ? `binwidth = ${layer.binwidth}` : "", pos, commonLine])})`;
      case "density": return `geom_density(${joinArgs([xOnlyMapping(), "inherit.aes = FALSE", pos, commonLine])})`;
      case "dotplot": return `geom_dotplot(${joinArgs([xOnlyMapping(), "inherit.aes = FALSE", `bins = ${Math.max(1, Math.round(num(layer.bins, 30)))}`, commonLine])})`;
      case "boxplot": return `geom_boxplot(${joinArgs([pos, commonLine])})`;
      case "violin": return `geom_violin(${joinArgs([pos, commonLine])})`;
      case "jitter": return `geom_jitter(${joinArgs(["width = 0.12", "height = 0", commonPoint])})`;
      case "quasirandom": return `ggbeeswarm::geom_quasirandom(${joinArgs([commonPoint])})`;
      case "smooth": return `geom_smooth(${joinArgs([layer.smoothMethod !== "auto" ? `method = ${rString(layer.smoothMethod)}` : "", `se = ${bool(layer.smoothSe)}`, commonLine])})`;
      case "area": return `geom_area(${joinArgs([pos, commonLine])})`;
      case "ribbon": return `geom_ribbon(${joinArgs([ribbonMapping(), "alpha = 0.25", colourArg("fill", layer.fill), layer.customParams])})`;
      case "tile": return `geom_tile(${commonLine})`;
      case "bin2d": return `geom_bin_2d(${joinArgs([`bins = ${Math.max(1, Math.round(num(layer.bins, 30)))}`, layer.customParams])})`;
      case "hex": return `geom_hex(${joinArgs([`bins = ${Math.max(1, Math.round(num(layer.bins, 30)))}`, layer.customParams])})`;
      case "contour": return `geom_density_2d(${commonLine})`;
      case "contour_filled": return `geom_contour_filled(data = rapid_density_surface(plot_data, ${rString(state.mappings.x || "")}, ${rString(state.mappings.y || "")}), mapping = aes(x = x, y = y, z = z, fill = after_stat(level)), inherit.aes = FALSE, ${joinArgs([`alpha = ${Number(num(layer.alpha, 0.85).toFixed(3))}`, `bins = ${Math.max(2, Math.round(num(layer.bins, 10)))}`, layer.customParams])})`;
      case "rug": return `geom_rug(${commonLine})`;
      case "text": return `geom_text(${joinArgs([labelMapping, nudge, textArgs])})`;
      case "label": return `geom_label(${joinArgs([labelMapping, nudge, textArgs])})`;
      case "text_repel": return `ggrepel::geom_text_repel(${joinArgs([labelMapping, nudge, `force = ${num(layer.repelForce, 1)}`, textArgs])})`;
      case "label_repel": return `ggrepel::geom_label_repel(${joinArgs([labelMapping, nudge, `force = ${num(layer.repelForce, 1)}`, textArgs])})`;
      case "errorbar": return `geom_errorbar(${joinArgs([intervalMapping(false), commonLine, "width = 0.18"])})`;
      case "pointrange": return `geom_pointrange(${joinArgs([intervalMapping(true), commonLine])})`;
      case "crossbar": return `geom_crossbar(${joinArgs([intervalMapping(true), commonLine, "width = 0.45"])})`;
      case "segment": return `geom_segment(${joinArgs([segmentFallbackMapping(), commonLine])})`;
      case "curve": return `geom_curve(${joinArgs([commonLine, "curvature = 0.25"])})`;
      case "richtext": return `ggtext::geom_richtext(${joinArgs([labelMapping, textLineArgs, "label.color = NA"])})`;
      case "ridgeline": return `ggridges::geom_density_ridges(${joinArgs([commonLine, "scale = 1.1"])})`;
      default: return `geom_point(${commonPoint})`;
    }
  }

  function colourArg(name, value) {
    const v = String(value || "").trim();
    return v ? `${name} = ${rString(v)}` : "";
  }

  function labelsCode() {
    const args = [];
    if (state.labels.title) args.push(`title = ${labelRValue(state.labels.title, state.labels.titleMode)}`);
    if (state.labels.subtitle) args.push(`subtitle = ${labelRValue(state.labels.subtitle, state.labels.subtitleMode)}`);
    if (state.labels.caption) args.push(`caption = ${labelRValue(state.labels.caption, state.labels.captionMode)}`);
    if (state.labels.xTitle) args.push(`x = ${labelRValue(state.labels.xTitle, state.labels.axisMode)}`);
    if (state.labels.yTitle) args.push(`y = ${labelRValue(state.labels.yTitle, state.labels.axisMode)}`);
    if (state.labels.colorTitle) args.push(`colour = ${rString(state.labels.colorTitle)}`);
    if (state.labels.fillTitle) args.push(`fill = ${rString(state.labels.fillTitle)}`);
    if (state.labels.sizeTitle) args.push(`size = ${rString(state.labels.sizeTitle)}`);
    if (state.labels.alphaTitle) args.push(`alpha = ${rString(state.labels.alphaTitle)}`);
    if (state.labels.shapeTitle) args.push(`shape = ${rString(state.labels.shapeTitle)}`);
    return args.length ? `labs(\n  ${args.join(",\n  ")}\n)` : "labs()";
  }

  function labelRValue(value, mode) {
    if (mode === "equation") return `latex2exp::TeX(${rString(value)})`;
    return rString(value);
  }

  function axisLabelFn(kind) {
    switch (kind) {
      case "comma": return "scales::label_comma()";
      case "percent": return "scales::label_percent(accuracy = 1)";
      case "dollar":
      case "euro": return "scales::label_dollar(prefix = '€', suffix = '')";
      case "scientific": return "scales::label_scientific()";
      default: return "";
    }
  }

  function transformArg(value) {
    return value && value !== "none" ? `trans = ${rString(value)}` : "";
  }

  function limitsArg(min, max) {
    const lo = String(min ?? "").trim();
    const hi = String(max ?? "").trim();
    if (!lo && !hi) return "";
    return `limits = c(${lo || "NA"}, ${hi || "NA"})`;
  }

  function scaleLines() {
    const lines = [];
    const xBreaks = Number(state.axis.xBreaks);
    const yBreaks = Number(state.axis.yBreaks);
    const xArgs = joinArgs([transformArg(state.axis.xTransform), limitsArg(state.axis.xMin, state.axis.xMax), Number.isFinite(xBreaks) && xBreaks > 0 ? `n.breaks = ${Math.round(xBreaks)}` : "", axisLabelFn(state.axis.xLabel) ? `labels = ${axisLabelFn(state.axis.xLabel)}` : ""]);
    const yArgs = joinArgs([transformArg(state.axis.yTransform), limitsArg(state.axis.yMin, state.axis.yMax), Number.isFinite(yBreaks) && yBreaks > 0 ? `n.breaks = ${Math.round(yBreaks)}` : "", axisLabelFn(state.axis.yLabel) ? `labels = ${axisLabelFn(state.axis.yLabel)}` : "", state.axis.secondaryY ? `sec.axis = sec_axis(~ . * ${state.axis.secondaryYFactor} + ${state.axis.secondaryYOffset}, name = ${rString(state.axis.secondaryYName)})` : ""]);
    if (xArgs && isNumericCol(state.mappings.x)) lines.push(`scale_x_continuous(${xArgs})`);
    if (yArgs && isNumericCol(state.mappings.y)) lines.push(`scale_y_continuous(${yArgs})`);
    if (state.mappings.color) {
      const scale = paletteScale("colour", state.palette.color, shouldUseDiscrete(column(state.mappings.color)), state.palette.reverse);
      if (scale) lines.push(scale);
    }
    if (state.mappings.fill || hasLayerGeom("contour_filled")) {
      const scale = paletteScale("fill", state.palette.fill, state.mappings.fill ? shouldUseDiscrete(column(state.mappings.fill)) : true, state.palette.reverse);
      if (scale) lines.push(scale);
    }
    if (state.mappings.size) lines.push("scale_size_area(max_size = 12)");
    return lines;
  }

  function paletteScale(aesName, palette, discrete, reverse) {
    if (palette === "none") return "";
    const scale = aesName === "colour" ? "scale_colour" : "scale_fill";
    const rev = bool(reverse);
    return discrete
      ? `rapid_discrete_scale(${rString(aesName)}, ${rString(palette)}, reverse = ${rev})`
      : `${scale}_gradientn(colours = rapid_gradient(${rString(palette)}, reverse = ${rev}))`;
  }

  function themeBase() {
    const family = ".base_family";
    const size = Number(state.theme.baseSize) || 12;
    switch (state.theme.preset) {
      case "gray": return `rapid_theme_from_function(ggplot2::theme_gray, ${family}, ${size})`;
      case "minimal": return `rapid_theme_from_function(ggplot2::theme_minimal, ${family}, ${size})`;
      case "classic": return `rapid_theme_from_function(ggplot2::theme_classic, ${family}, ${size})`;
      case "bw": return `rapid_theme_from_function(ggplot2::theme_bw, ${family}, ${size})`;
      case "light": return `rapid_theme_from_function(ggplot2::theme_light, ${family}, ${size})`;
      case "dark": return `rapid_theme_from_function(ggplot2::theme_dark, ${family}, ${size})`;
      case "void": return `rapid_theme_from_function(ggplot2::theme_void, ${family}, ${size})`;
      case "linedraw": return `rapid_theme_from_function(ggplot2::theme_linedraw, ${family}, ${size})`;
      case "test": return `rapid_theme_from_function(ggplot2::theme_test, ${family}, ${size})`;
      case "economist": return `rapid_theme_from_function(ggthemes::theme_economist, ${family}, ${size})`;
      case "tufte": return `rapid_theme_from_function(ggthemes::theme_tufte, ${family}, ${size})`;
      case "few": return `rapid_theme_from_function(ggthemes::theme_few, ${family}, ${size})`;
      case "fivethirtyeight": return `rapid_theme_from_function(ggthemes::theme_fivethirtyeight, ${family}, ${size})`;
      case "stata": return `rapid_theme_from_function(ggthemes::theme_stata, ${family}, ${size})`;
      case "wsj": return `rapid_theme_from_function(ggthemes::theme_wsj, ${family}, ${size})`;
      case "solarized": return `rapid_theme_from_function(ggthemes::theme_solarized, ${family}, ${size})`;
      case "pander": return `rapid_theme_from_function(ggthemes::theme_pander, ${family}, ${size})`;
      case "calc": return `rapid_theme_from_function(ggthemes::theme_calc, ${family}, ${size})`;
      case "hc": return `rapid_theme_from_function(ggthemes::theme_hc, ${family}, ${size})`;
      case "excel": return `rapid_theme_from_function(ggthemes::theme_excel, ${family}, ${size})`;
      default: return `theme_rapid(base_family = ${family}, base_size = ${size})`;
    }
  }

  function textElement(kind, args) {
    const mode = kind === "title" ? state.labels.titleMode : kind === "subtitle" ? state.labels.subtitleMode : kind === "caption" ? state.labels.captionMode : kind === "axis" ? state.labels.axisMode : kind === "legend" ? state.labels.legendMode : "plain";
    const fun = mode === "markdown" ? "ggtext::element_markdown" : "element_text";
    return `${fun}(${args})`;
  }

  function rColorOrNA(value) {
    const v = String(value || "").trim();
    return v ? rString(v) : "NA";
  }

  function themeOverride() {
    const t = state.theme;
    const textCol = rString(t.textColor || "#111827");
    const titlePositionArea = state.labels.title ? (state.labels.titleArea || "plot") : (state.labels.subtitleArea || state.labels.titleArea || "plot");
    const args = [
      `text = element_text(family = .base_family, colour = ${textCol})`,
      `plot.title.position = ${rString(titlePositionArea)}`,
      `plot.caption.position = ${rString(state.labels.captionArea || "plot")}`,
      `plot.title = ${textElement("title", joinArgs(["family = .base_family", `size = ${t.titleSize}`, `face = ${rString(t.titleFace)}`, `colour = ${textCol}`, `hjust = ${textAlignHjust(state.labels.titleAlign)}`, "margin = margin(b = 6)"]))}`,
      `plot.subtitle = ${textElement("subtitle", joinArgs(["family = .base_family", `size = ${t.subtitleSize}`, `face = ${rString(t.subtitleFace)}`, `colour = ${textCol}`, `hjust = ${textAlignHjust(state.labels.subtitleAlign)}`, "margin = margin(b = 10)"]))}`,
      `plot.caption = ${textElement("caption", joinArgs(["family = .base_family", `size = ${t.captionSize}`, `face = ${rString(t.captionFace)}`, `colour = scales::alpha(${textCol}, 0.72)`, `hjust = ${textAlignHjust(state.labels.captionAlign)}`, "margin = margin(t = 8)"]))}`,
      `plot.margin = margin(${num(t.plotMarginTopPt, 12)}, ${num(t.plotMarginRightPt, 16)}, ${num(t.plotMarginBottomPt, 12)}, ${num(t.plotMarginLeftPt, 16)}, unit = "pt")`,
      `axis.title = ${textElement("axis", joinArgs(["family = .base_family", `size = ${t.axisTitleSize}`, `face = ${rString(t.axisTitleFace)}`, `colour = ${textCol}`]))}`,
      `axis.title.x = ${textElement("axis", joinArgs(["family = .base_family", `size = ${t.axisTitleSize}`, `face = ${rString(t.axisTitleFace)}`, `colour = ${textCol}`, `hjust = ${xTitleHjust(state.axis.xTitlePosition)}`, `margin = margin(t = ${num(state.axis.xTitleMarginPt, 10)})`]))}`,
      `axis.title.y = ${textElement("axis", joinArgs(["family = .base_family", `size = ${t.axisTitleSize}`, `face = ${rString(t.axisTitleFace)}`, `colour = ${textCol}`, `hjust = ${yTitleHjust(state.axis.yTitlePosition)}`, `margin = margin(r = ${num(state.axis.yTitleMarginPt, 20)})`]))}`,
      `axis.text = element_text(family = .base_family, size = ${t.axisTextSize}, face = ${rString(t.axisTextFace)}, colour = scales::alpha(${textCol}, 0.82))`,
      `axis.text.x = element_text(family = .base_family, size = ${t.axisTextSize}, face = ${rString(t.axisTextFace)}, angle = ${num(state.axis.xAngle, 0)}, hjust = ${num(state.axis.xAngle, 0) === 0 ? 0.5 : 1}, vjust = ${num(state.axis.xAngle, 0) === 0 ? 0.5 : 1})`,
      `axis.text.y = element_text(family = .base_family, size = ${t.axisTextSize}, face = ${rString(t.axisTextFace)}, angle = ${num(state.axis.yAngle, 0)})`,
      `strip.text = element_text(family = .base_family, size = ${t.stripTextSize}, face = ${rString(t.stripTextFace)}, colour = ${textCol})`,
      `plot.background = element_rect(fill = ${rColorOrNA(t.plotBackground)}, colour = NA)`,
      `panel.background = element_rect(fill = ${rColorOrNA(t.panelBackground)}, colour = NA)`,
      t.majorGrid === "blank" ? `panel.grid.major = element_blank()` : `panel.grid.major = element_line(colour = ${rColorOrNA(t.gridColor)}, linewidth = 0.25)`,
      t.minorGrid === "blank" ? `panel.grid.minor = element_blank()` : `panel.grid.minor = element_line(colour = scales::alpha(${rColorOrNA(t.gridColor)}, 0.55), linewidth = 0.15)`,
      t.panelBorder === "blank" ? `panel.border = element_blank()` : `panel.border = element_rect(fill = NA, colour = ${rColorOrNA(t.gridColor)}, linewidth = 0.4)`,
      t.removeAxisTitleX ? `axis.title.x = element_blank()` : "",
      t.removeAxisTitleY ? `axis.title.y = element_blank()` : "",
      t.removeAxisTextX ? `axis.text.x = element_blank()` : "",
      t.removeAxisTextY ? `axis.text.y = element_blank()` : "",
      t.removeTicks ? `axis.ticks = element_blank()` : "",
      t.removeStrips ? `strip.text = element_blank()` : ""
    ].filter(Boolean);
    return "theme(\n  " + args.join(",\n  ") + "\n)";
  }

  function legendCode() {
    const l = state.legend;
    const position = !l.show || l.position === "none" ? `legend.position = "none"` : l.inside ? `legend.position = "inside"` : `legend.position = ${rString(l.position)}`;
    const inside = l.inside && l.show ? `legend.position.inside = c(${num(l.insideX, .98)}, ${num(l.insideY, .98)})` : "";
    const keyWidth = String(l.keyWidthPt || "").trim() ? `legend.key.width = unit(${num(l.keyWidthPt, l.keySizePt || 11)}, "pt")` : "";
    const keyHeight = String(l.keyHeightPt || "").trim() ? `legend.key.height = unit(${num(l.keyHeightPt, l.keySizePt || 11)}, "pt")` : "";
    const borderOn = Boolean(String(l.border || "").trim());
    const args = [
      position,
      inside,
      `legend.justification = ${legendJustification(l.justification)}`,
      `legend.direction = ${rString(l.direction)}`,
      `legend.box = ${rString(l.box)}`,
      `legend.title.position = ${rString(l.titlePosition)}`,
      `legend.title = ${textElement("legend", joinArgs(["family = .base_family", `size = ${l.titleSize}`, `face = ${rString(l.titleFace)}`]))}`,
      `legend.text = ${textElement("legend", joinArgs(["family = .base_family", `size = ${l.textSize}`, `face = ${rString(l.textFace)}`]))}`,
      `legend.key.size = unit(${num(l.keySizePt, 11)}, "pt")`,
      keyWidth,
      keyHeight,
      `legend.spacing.x = unit(${num(l.spacingXPt, 4)}, "pt")`,
      `legend.spacing.y = unit(${num(l.spacingYPt, 4)}, "pt")`,
      `legend.background = element_rect(fill = ${rColorOrNA(l.background)}, colour = ${rColorOrNA(l.border)}, linewidth = ${borderOn ? 0.3 : 0})`,
      `legend.key = element_rect(fill = NA, colour = NA)`,
      `legend.box.background = element_rect(fill = NA, colour = NA)`,
      `legend.margin = margin(5, 5, 5, 5)`
    ].filter(Boolean);
    const theme = "theme(\n  " + args.join(",\n  ") + "\n)";
    const guides = guideCode();
    return guides ? theme + " +\n  " + guides : theme;
  }

  function legendJustification(value) {
    const map = { topright: "c(1, 1)", topleft: "c(0, 1)", bottomright: "c(1, 0)", bottomleft: "c(0, 0)" };
    return map[value] || rString(value || "center");
  }

  function guideCode() {
    const l = state.legend;
    const args = joinArgs([
      l.nrow ? `nrow = ${l.nrow}` : "",
      l.ncol ? `ncol = ${l.ncol}` : "",
      l.reverse ? "reverse = TRUE" : "",
      l.byrow ? "byrow = TRUE" : "",
      l.overrideSize || l.overrideAlpha ? `override.aes = list(${joinArgs([l.overrideSize ? `size = ${l.overrideSize}` : "", l.overrideAlpha ? `alpha = ${l.overrideAlpha}` : ""])})` : ""
    ]);
    if (!args) return "";
    const guides = [];
    if (state.mappings.color && shouldUseDiscrete(column(state.mappings.color))) guides.push(`colour = guide_legend(${args})`);
    if ((state.mappings.fill && shouldUseDiscrete(column(state.mappings.fill))) || hasLayerGeom("contour_filled")) guides.push(`fill = guide_legend(${args})`);
    if (state.mappings.shape) guides.push(`shape = guide_legend(${args})`);
    if (state.mappings.size) guides.push(`size = guide_legend(${args})`);
    return guides.length ? "guides(\n  " + guides.join(",\n  ") + "\n)" : "";
  }

  function annotationCode() {
    return state.annotations.map(a => {
      const colour = rColorOrNA(a.color);
      const fill = rColorOrNA(a.fill);
      switch (a.type) {
        case "text": return a.mode === "equation" ? `annotate("text", x = ${a.x || "Inf"}, y = ${a.y || "Inf"}, label = latex2exp::TeX(${rString(a.label)}), family = .base_family, colour = ${colour}, size = ${num(a.size, 3.4)}, alpha = ${num(a.alpha, .95)})` : `annotate("text", x = ${a.x || "Inf"}, y = ${a.y || "Inf"}, label = ${rString(a.label)}, family = .base_family, colour = ${colour}, size = ${num(a.size, 3.4)}, alpha = ${num(a.alpha, .95)})`;
        case "label": return a.mode === "equation" ? `annotate("label", x = ${a.x || "Inf"}, y = ${a.y || "Inf"}, label = latex2exp::TeX(${rString(a.label)}), family = .base_family, colour = ${colour}, fill = ${fill}, size = ${num(a.size, 3.4)}, alpha = ${num(a.alpha, .95)})` : `annotate("label", x = ${a.x || "Inf"}, y = ${a.y || "Inf"}, label = ${rString(a.label)}, family = .base_family, colour = ${colour}, fill = ${fill}, size = ${num(a.size, 3.4)}, alpha = ${num(a.alpha, .95)})`;
        case "richtext": return `ggtext::geom_richtext(data = data.frame(x = ${a.x || "Inf"}, y = ${a.y || "Inf"}, label = ${rString(a.label)}), mapping = aes(x = x, y = y, label = label), inherit.aes = FALSE, family = .base_family, colour = ${colour}, fill = ${fill}, size = ${num(a.size, 3.4)}, alpha = ${num(a.alpha, .95)}, label.color = NA)`;
        case "hline": return `geom_hline(yintercept = ${a.y || 0}, colour = ${colour}, linewidth = ${num(a.linewidth, .5)}, alpha = ${num(a.alpha, .95)})`;
        case "vline": return `geom_vline(xintercept = ${a.x || 0}, colour = ${colour}, linewidth = ${num(a.linewidth, .5)}, alpha = ${num(a.alpha, .95)})`;
        case "rect": return `annotate("rect", xmin = ${a.xmin || "-Inf"}, xmax = ${a.xmax || "Inf"}, ymin = ${a.ymin || "-Inf"}, ymax = ${a.ymax || "Inf"}, fill = ${fill}, colour = ${colour}, alpha = ${num(a.alpha, .25)})`;
        case "segment": return `annotate("segment", x = ${a.x || 0}, xend = ${a.xend || 0}, y = ${a.y || 0}, yend = ${a.yend || 0}, colour = ${colour}, linewidth = ${num(a.linewidth, .5)}, alpha = ${num(a.alpha, .95)})`;
        default: return "";
      }
    }).filter(Boolean);
  }

  function facetCode() {
    if (state.facet.mode === "wrap" && state.facet.wrapBy) return `facet_wrap(vars(${rName(state.facet.wrapBy)}), ncol = ${Math.max(1, Math.round(num(state.facet.ncol, 2)))}, scales = ${rString(state.facet.scales)})`;
    if (state.facet.mode === "grid" && (state.mappings.facetRow || state.mappings.facetCol)) {
      const row = state.mappings.facetRow ? rName(state.mappings.facetRow) : "";
      const col = state.mappings.facetCol ? rName(state.mappings.facetCol) : "";
      return `facet_grid(rows = vars(${row}), cols = vars(${col}), scales = ${rString(state.facet.scales)})`;
    }
    return "";
  }

  function coordCode() {
    const clip = `clip = ${rString(state.axis.clip)}`;
    if (state.axis.polar) return `coord_polar(${clip})`;
    if (state.axis.flip) return `coord_flip(${clip})`;
    if (state.axis.fixed) return `coord_fixed(ratio = ${num(state.axis.coordRatio, 1)}, ${clip})`;
    if (state.axis.clip === "off") return `coord_cartesian(${clip})`;
    return "";
  }

  function cleanLines(code) {
    return String(code || "").split("\n").map(x => x.trimEnd()).filter(x => x.trim());
  }

  function asAddition(code) {
    return cleanLines(code).join("\n").replace(/^\+\s*/, "").trim();
  }

  function exportWidth() {
    return state.export.units === "cm" ? Number(state.export.widthCm) || 16 : Math.round(Number(state.export.widthPx) || 1200);
  }

  function exportHeight() {
    return state.export.units === "cm" ? Number(state.export.heightCm) || 10 : Math.round(Number(state.export.heightPx) || 750);
  }

  function formatRatio(r) {
    const x = Number(r) || 1;
    if (Math.abs(x - 1) < 0.002) return "1:1";
    if (Math.abs(x - 1.333333) < 0.002) return "4:3";
    if (Math.abs(x - 1.6) < 0.002) return "16:10";
    if (Math.abs(x - 1.777778) < 0.002) return "16:9";
    return x.toFixed(2);
  }

  function geomLabel(geom) {
    return (geomCatalog.find(g => g[0] === geom) || [geom, geom])[1];
  }

  bindKeyboardShortcuts();
  if (state.backend === "webr") setWebRFontList({ quiet: true });
  renderApp();
  refreshFontsForBackend({ quiet: true });
  detectLocalBackendOnStart();
  if (state.wizardStarted && state.autoRender) scheduleRender();
})();
