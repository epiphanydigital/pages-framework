import {ViewProps} from "../eleventy";
import {Heading} from "../components/Heading";

/**
 * This is used for just about every page and it provides the border around the content.  The home page will use WideLayout.11ty.tsx.
 */

export function MainLayout({content, title}: ViewProps): JSX.Element {
    return (
        <html lang="en">
        <head>
            <title>{title}</title>
            <link rel="stylesheet" href="/css/global.css"/>
        </head>
        <body>

            {content}
        </body>
        </html>
    );
}

export const render = MainLayout;
