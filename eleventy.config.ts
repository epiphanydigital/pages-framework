import {renderToString} from "jsx-async-runtime";
import * as sass from "sass";
import * as path from 'path';

export default function (config: any) {

    let pathPrefix = '/';

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


    //// SVG Sprite Plugin for USWDS USWDS icons
    // config.addPlugin(svgSprite, {
    //     path: "./node_modules/@uswds/uswds/dist/img/uswds-icons",
    //     svgSpriteShortcode: 'uswds_icons_sprite',
    //     svgShortcode: 'uswds_icons'
    // });

    //// SVG Sprite Plugin for USWDS USA icons
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


    // Watch CSS files for changes
    config.setBrowserSyncConfig({
        injectChanges: true,
        files: './dist/**/*.css'
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
            input: "site",
            layouts: "../_layouts",
            output: "dist",
        },
    };
}
