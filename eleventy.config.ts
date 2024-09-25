import {renderToString} from "jsx-async-runtime";
import * as sass from "sass";
import * as path from 'path';
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import fs from 'fs';
import yaml from "js-yaml";


module.exports = function (config: any) {

    let pathPrefix = '/';

    // Copy the `admin` folders to the output
    config.addPassthroughCopy('admin');

    // Copy USWDS init JS so we can load it in HEAD to prevent banner flashing
    config.addPassthroughCopy({'./node_modules/@uswds/uswds/dist/js/uswds-init.js': 'assets/js/uswds-init.js'});


    /**
     * TODO: Need to find an alternative or see if there was an upgrade path for svgSprite
     */
    //// SVG Sprite Plugin for USWDS USWDS icons
    // config.addPlugin(svgSprite, {
    //     path: "./node_modules/@uswds/uswds/dist/img/uswds-icons",
    //     svgSpriteShortcode: 'uswds_icons_sprite',
    //     svgShortcode: 'uswds_icons'
    // });
    //
    // //// SVG Sprite Plugin for USWDS USA icons
    // config.addPlugin(svgSprite, {
    //     path: "./node_modules/@uswds/uswds/dist/img/usa-icons",
    //     svgSpriteShortcode: 'usa_icons_sprite',
    //     svgShortcode: 'usa_icons'
    // });


    config.addLiquidShortcode("uswds_icon", function (name: any) {
        return `
    <svg class="usa-icon" aria-hidden="true" role="img">
      <use xlink:href="#svg-${name}"></use>
    </svg>`;
    });

    config.addDataExtension("yaml", (contents: any) => yaml.load(contents));

    // Customize Markdown library and settings:
    // @ts-ignore
    let markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
    }).use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.ariaHidden({
            placement: 'after',
            class: 'direct-link',
            symbol: '#',
            // level: [1, 2, 3, 4], // TODO: Look into this... property doesn't exist.
        }),
        slugify: config.getFilter('slug'),
    });
    config.setLibrary('md', markdownLibrary);

    // Copy USWDS init JS so we can load it in HEAD to prevent banner flashing
    // config.addPassthroughCopy({'./node_modules/@uswds/uswds/dist/js/uswds-init.js': 'assets/js/uswds-init.js'});
    config.addTemplateFormats('scss');

    config.addExtension('scss', {
        outputFileExtension: 'css',
        compile: async function (inputContent: any, inputPath: any) {
            let parsedPath = path.parse(inputPath);

            let result = sass.compileString(inputContent, {
                loadPaths: [parsedPath.dir || '.', this.config.dir.includes],
            });

            return async () => result.css;
        },
    });

    // Override Browsersync defaults (used only with --serve)
    config.setBrowserSyncConfig({
        callbacks: {
            ready: function (err: any, browserSync: {
                addMiddleware: (arg0: string, arg1: (req: any, res: any) => void) => void;
            }) {
                const content_404 = fs.readFileSync('_site/404/index.html');

                browserSync.addMiddleware('*', (req, res) => {
                    // Provides the 404 content without redirect.
                    res.writeHead(404, {'Content-Type': 'text/html; charset=UTF-8'});
                    res.write(content_404);
                    res.end();
                });
            },
        },
        ui: false,
        ghostMode: false,
        injectChanges: true,
        files: './dist/**/*.css'
    });

    // Set image shortcodes
    // TODO: .config doesn't exist in this project or the existing pages project
    // config.addLiquidShortcode('image', imageShortcode);
    // config.addLiquidShortcode('image_with_class', imageWithClassShortcode);
    config.addLiquidShortcode("uswds_icon", function (name: any) {
        return `
    <svg class="usa-icon" aria-hidden="true" role="img">
      <use xlink:href="#svg-${name}"></use>
    </svg>`;
    });

    config.addWatchTarget("./site/");
    config.addWatchTarget("./_src/sass/");

    config.addExtension(["11ty.jsx", "11ty.ts", "11ty.tsx"], {
        key: "11ty.js",
    });

    config.addTransform("tsx", async (content: any) => {
        const result = await renderToString(content);
        return `<!doctype html>\n${result}`;
    });

    // If BASEURL env variable exists, update pathPrefix to the BASEURL
    if (process.env.BASEURL) {
        pathPrefix = process.env.BASEURL
    }

    return {
        templateFormats: ['md', 'njk', 'html', 'liquid'],
        markdownTemplateEngine: 'liquid',
        htmlTemplateEngine: 'liquid',
        pathPrefix: pathPrefix,
        dir: {
            includes: ["./node_modules", "./node_modules/@uswds/uswds/packages"],
            input: "site",
            layouts: "../_layouts",
            output: "dist",
        },
    };
}
