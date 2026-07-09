# RapidGG Wizard

RapidGG Wizard is an [R](https://www.r-project.org/) package containing a browser-based, point-and-click builder for [`ggplot2`](https://ggplot2.tidyverse.org/index.html) charts. It runs with either:

1. **Local R**, served by a small [plumber](https://www.rplumber.io/) backend, or
2. [**WebR**](https://docs.r-wasm.org/webr/), running R directly inside the browser: see https://alekrutkowski.github.io/RapidGG-Wizard/

The app focuses on fast visual exploration, reproducible output, and a clean interface. Every chart can be exported as a plot file, an annotated R script, and a JSON state file that restores the wizard exactly.

<img width="3352" height="2136" alt="image" src="https://github.com/user-attachments/assets/0314f4ee-b8a2-4348-8b74-6fd4009e8748" />

<img width="3353" height="2241" alt="image" src="https://github.com/user-attachments/assets/6199def7-b76d-4098-af2d-062fdb79fe8c" />

## Main features

- Visual plot gallery with graphical starting points for scatterplots, bubble plots, line plots, bars, histograms, densities, ridgelines, heatmaps, binned plots, contours, filled contours, text labels, `ggrepel`, intervals, lollipops, facets, and more.
- Drag-and-drop aesthetic mappings for x, y, colour, fill, size, alpha, shape, label, group, intervals, segments, contours, and facets.
- Multiple layers using common `ggplot2` geoms plus satellite packages such as `ggrepel`, `ggtext`, `ggridges`, `ggbeeswarm`, and `hexbin`.
- Searchable settings panel for finding controls by name or concept.
- Rich styling controls for themes, fonts, text sizes, faces, backgrounds, grids, axes, legends, palettes, annotations, facets, coordinates, secondary axes, aspect ratio, and export settings.
- Web font workflow for WebR using Google Fonts, with SVG previews rendered inline in the page.
- Local font workflow for local R using `systemfonts` where available.
- Export to SVG, PNG, PDF, JPG, TIFF, and EMF, with DPI control for raster output. TIFF previews use UTIF.js. For EMF export, the app shows an SVG preview generated from the same plot settings and keeps the actual EMF available from **Download chart**.
- Copy or download the generated R script.
- Download or import a JSON wizard state file, or paste the magic state string embedded in the generated R script.
- Local browser storage recovery after an accidental tab close.
- Undo and redo buttons plus Ctrl+Z and Ctrl+Y shortcuts.
- Light and dark interface themes.

## Installation

Install the package from GitHub:

```r
# install.packages("remotes")
remotes::install_github("alekrutkowski/rapidggwizard")
```

Install the suggested plotting packages for the richest experience:

```r
install.packages(c(
  "ggplot2", "scales", "ggrepel", "ggtext", "latex2exp", "ggthemes",
  "ggridges", "ggbeeswarm", "hexbin", "MASS", "svglite", "ragg",
  "devEMF", "systemfonts", "showtext", "sysfonts", "plumber", "jsonlite", "base64enc"
))
```

Start the local app:

```r
rapidggwizard::run_app()
```

The local app opens the browser automatically. If it does not, open:

```text
http://127.0.0.1:8787
```

You can also run the app from a source checkout without installing the package:

```bash
Rscript scripts/install-deps.R
Rscript scripts/run-local.R
```

The source checkout runner opens the browser automatically. To suppress that behavior, set `RAPIDGG_BROWSE=false` before starting it.

On Windows PowerShell from the project root:

```powershell
Rscript scripts\install-deps.R
Rscript scripts\run-local.R
```

## GitHub Pages deployment with WebR

The repository contains a static WebR app in `docs/` and a GitHub Actions workflow in `.github/workflows/pages.yml`.

To publish it:

1. Push this repository to GitHub.
2. Open the repository settings.
3. Enable GitHub Pages with **GitHub Actions** as the source.
4. Push to `main`, or run the **Deploy static WebR app to GitHub Pages** workflow manually.

The Pages version uses WebR only. Local R rendering is available when the app is run through `rapidggwizard::run_app()` or `Rscript scripts/run-local.R`.

WebR pages need cross-origin isolation. The static app includes a small service worker for that purpose. When served by local R, the Plumber backend also sends the required headers.

## Quick user manual

### 1. Start with a visual plot type

When the app opens, choose a chart from the plot gallery. Each card contains a small graphical thumbnail and a short explanation of when that plot is useful.

Typical choices:

- **Scatter** for relationships between two numeric variables.
- **Bubble** when a third numeric variable should control point size.
- **Density** for comparing smooth distributions.
- **Count bar** for category frequencies.
- **Small multiples** when the same relationship should be compared across groups.
- **Filled contour** when a smooth surface or density band should be displayed over two numeric variables.

You can upload a CSV before choosing a plot, or begin with the built-in demo data.

### 2. Map columns by drag and drop

After choosing a plot type, drag columns into mapping bubbles such as X, Y, Colour, Fill, Size, Label, Group, Facet row, and Facet col.

Empty mapping bubbles have a lighter background. Filled bubbles show the selected column and a clear button.

A quick rule of thumb:

- X and Y usually define the visual geometry.
- Colour and Fill separate groups.
- Size is best for numeric magnitude.
- Label is for text, label, `ggrepel`, and rich-text layers.
- Facet row and Facet col split the plot into panels.

### 3. Add and edit layers

The Layers panel controls the actual geoms. Each layer card shows the geom it uses, with a link to the relevant manual page.

Examples:

- Add `geom_smooth()` to a scatterplot for a trend.
- Add `ggrepel::geom_text_repel()` when labels overlap.
- Add `geom_rug()` to show marginal observation positions.
- Use `geom_contour_filled()` for filled contour bands.

Layer-specific arguments can be entered in the raw argument box. For example:

```r
na.rm = TRUE
```

### 4. Search for settings

Use **Find a setting** to jump directly to controls. Useful searches include:

```text
font
legend
grid
axis title
markdown
palette
aspect
export
```

### 5. Work with text, markdown, HTML, and equations

The Text panel controls title, subtitle, caption, axis titles, and legend titles.

Text rendering modes:

- **Plain** uses standard ggplot text.
- **Markdown or HTML** uses `ggtext` for simple rich text.
- **Equation** uses `latex2exp` to turn LaTeX-style input into plotmath expressions.

Example title using markdown:

```text
**Fuel economy** by vehicle weight
```

Example equation title:

```text
$y = \alpha + \beta x + \epsilon$
```

Title, subtitle, caption, and axis title positions are available as ordinary controls, not only as raw theme overrides.

### 6. Style the chart

The Style panel controls:

- Theme preset.
- Whether the preset should override custom style controls.
- Base font family.
- Text sizes and faces.
- Plot background, panel background, and grid colour.
- Grid and panel-border removal.
- Palette selection and custom palette construction.

For WebR, the font list is populated from Google Fonts and a selected font is loaded into the browser for inline SVG preview. For local R, the font list is populated from installed fonts discovered by local R.

### 7. Build a custom palette visually

Open **Style** and then **Palettes**. In **Custom palette**, add, remove, and edit colours with colour pickers. Click **Use for colour and fill** to apply the custom palette to both scales.

The generated R script includes the palette values, so the plot can be recreated later without relying on the wizard.

### 8. Control the legend

The Legend panel includes controls for:

- Showing or hiding the legend.
- Position and direction.
- Inside-panel placement.
- Justification.
- Legend title and text size.
- Key size, key width, key height, and spacing.
- Guide rows and columns.
- Guide override aesthetics.
- Legend background and border.

The legend border is disabled by default. Colour fields with a red ✖ can be disabled.

### 9. Export the plot

The Export panel controls:

- Format: SVG, PNG, PDF, JPG, TIFF, or EMF.
- Units: centimeters or pixels.
- DPI for raster output and pixel conversion.
- Plot aspect ratio.
- Export background, including transparent output.

Click **Download chart** to save the rendered file.

### 10. Reproduce everything

Use these outputs:

- **Copy R code** or **Download R code** for an exact reproducible script.
- **Download JSON state** to save the full wizard state.
- **Open JSON state** from the gallery page to restore a previous session before choosing a new plot type.

The app also auto-saves state in local browser storage.

## Examples

### Example A: Scatterplot with labels

1. Choose **Scatter**.
2. Map `wt` to X and `mpg` to Y.
3. Map `am` to Colour.
4. Add a `ggrepel::geom_text_repel()` layer.
5. Map `model` to Label.
6. Search for `legend` and move the legend to the bottom.
7. Export as SVG.

### Example B: Density comparison

1. Choose **Density**.
2. Map `mpg` to X.
3. Map `am` to Colour and Fill.
4. Set layer alpha to about `0.35`.
5. Choose a palette such as Viridis, Okabe-Ito, or a custom palette.
6. Add a markdown subtitle explaining the grouping.

### Example C: Faceted lines

1. Choose **Faceted line**.
2. Map a numeric or ordered variable to X.
3. Map the response to Y.
4. Put a grouping variable into Facet col.
5. Use the Facets panel to choose fixed or free scales.
6. Use the Axes panel to rotate x-axis text if labels overlap.

### Example D: Filled contour

1. Choose **Filled contour**.
2. Map two numeric variables to X and Y.
3. Adjust the number of bins in the layer card.
4. Choose a continuous palette.
5. Export as SVG or PNG.


### Restoring from a magic state string

Every generated R script includes a comment beginning with `# RapidGG magic state:`. Copy the `RGW1:` string from that comment, click **Paste magic** in the app, and paste it. This restores the same mappings, layers, palette, theme, annotations, export settings, and embedded data without opening a JSON file.

### Fonts and output formats

For WebR, the font list is populated from Google Fonts. The SVG preview loads the chosen web font in the browser, while generated R code asks `systemfonts` to make that font available to WebR before plotting. For local R, the font list is populated from fonts discovered by the local R session. Raster output uses `ragg` when available; SVG output uses `svglite` when available; PDF output can use `showtext`/`sysfonts` when these packages are installed; EMF output uses `devEMF` only when EMF is selected. When EMF is selected, the browser preview is SVG, so the downloadable EMF may differ a bit from the preview.

### Axis spacing and tick density

Use **Axes > Axis title positions** to move axis titles and adjust their distance from the tick labels. Use **Style > Backgrounds, grids, and removals > Plot margins** to give the whole plot more room. Use **Axes > Tick and grid-line density** to request more or fewer major ticks; major grid lines follow those major ticks when the major grid is enabled.

## Troubleshooting

### The app opens but WebR takes time on first render

The first WebR render may need to load WebR and install WebAssembly R packages. The app shows a spinner while this happens. Later renders are faster in the same browser session.

### Local R fonts do not look as expected

Install or update the font-aware graphics packages:

```r
install.packages(c("systemfonts", "svglite", "ragg", "showtext", "sysfonts"))
```

RapidGG Wizard attempts to resolve the chosen family with `systemfonts`, register a temporary plotting alias, and then use that alias in the generated ggplot theme. If a font cannot be resolved by R, the generated script falls back to `sans` instead of failing.

### The GitHub Pages version does not use local R

That is expected. GitHub Pages serves static files only, so the Pages version uses WebR. Run the local R app for Plumber-backed rendering.

## Useful documentation

- WebR: https://docs.r-wasm.org/webr/latest/
- Serving pages with WebR: https://docs.r-wasm.org/webr/latest/serving.html
- Google Fonts CSS API: https://developers.google.com/fonts/docs/css2
- ggplot2 reference: https://ggplot2.tidyverse.org/reference/
- ggsave: https://ggplot2.tidyverse.org/reference/ggsave.html
- systemfonts: https://systemfonts.r-lib.org/
- svglite fonts: https://svglite.r-lib.org/articles/fonts.html
- devEMF: https://cran.r-project.org/package=devEMF
- showtext: https://cran.r-project.org/package=showtext
- Plumber: https://www.rplumber.io/

## License

MIT © 2026 Alek Rutkowski


## TIFF previews and EMF downloads

When TIFF is selected as the export format, the app decodes the rendered TIFF in the browser with UTIF.js and shows a PNG preview while keeping the original TIFF available through **Download chart**. When EMF is selected, the browser preview is intentionally SVG, generated from the same wizard state. The real EMF file remains available through **Download chart**, and the interface displays a small note that the downloadable EMF may differ a bit from the SVG preview.
