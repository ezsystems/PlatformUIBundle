# Content Type icons

* Author: Damien Pobel <dp@ez.no>
* Created: 2016-05-20
* JIRA: https://jira.ez.no/browse/EZP-23022
* Status: Design Review

## Context

A Content Item is a kind of instance of a Content Type. The type of a Content
Item is a very important information to provide to the user. One graphical way
to carry this information is to use an icon near the Content Item name. This
is especially useful when the available space is limited like while displaying
the content tree. By essence, the Content Types are project specific so it's
important to make that feature easy to configure and to extend for integrators.

### How it worked in eZ Publish

In eZ Publish, the Content Type icons were defined in an ini setting file
called icon.ini. Here's an how this was written:

```ini
[ClassIcons]
# Default icon if there is no class match
Default=mimetypes/empty.png
# Mapping from a class identifier to it's icon file,
# the whole filename must be included
ClassMap[]
ClassMap[article]=mimetypes/document.png
ClassMap[file]=mimetypes/binary.png
ClassMap[folder]=filesystems/folder.png
ClassMap[image]=mimetypes/image.png
ClassMap[product]=apps/package.png
ClassMap[user]=apps/personal.png
ClassMap[user_group]=apps/kuser.png
ClassMap[weblog]=mimetypes/document.png
```
When no rule matches the configuration, a default icon is being used.

In this configuration file, it was possible to reference images provided by
default in eZ Publish, but it was also possible to provide custom images for
custom Content Type or to replace the default ones.

By default, the following icons files were available in eZ Publish:

* `apps/package_network.png`
* `apps/package_settings.png`
* `apps/package.png`
* `apps/kuser.png`
* `apps/acroread.png`
* `apps/personal.png`
* `apps/locale.png`
* `actions/identity.png`
* `actions/view_tree.png`
* `filesystems/folder_image.png`
* `filesystems/folder_video.png`
* `filesystems/folder_man.png`
* `filesystems/folder_txt.png`
* `filesystems/folder.png`
* `mimetypes/exec_wine.png`
* `mimetypes/tar.png`
* `mimetypes/sound.png`
* `mimetypes/pdf.png`
* `mimetypes/access.png`
* `mimetypes/real.png`
* `mimetypes/quicktime.png`
* `mimetypes/visio.png`
* `mimetypes/binary.png`
* `mimetypes/txt.png`
* `mimetypes/rpm.png`
* `mimetypes/word.png`
* `mimetypes/tex.png`
* `mimetypes/log.png`
* `mimetypes/txt2.png`
* `mimetypes/excel.png`
* `mimetypes/readme.png`
* `mimetypes/video.png`
* `mimetypes/dvi.png`
* `mimetypes/document.png`
* `mimetypes/real_doc.png`
* `mimetypes/powerpoint.png`
* `mimetypes/html.png`
* `mimetypes/ascii.png`
* `mimetypes/empty.png`
* `mimetypes/tgz.png`
* `mimetypes/wordprocessing.png`
* `mimetypes/publisher.png`
* `mimetypes/image.png`

## Font icons + CSS

The icons in the PlatformUI interface are provided by an icon font. For Content
Type, the idea is to expand that concept so that while generating the interface,
we end up with a code similar to:

```html
<h1 class="ez-contenttype-icon ez-contenttype-icon-folder">Folder Name</h1>
```

With such classes, the `h1` is specified to display a Content Type icon. The
class `ez-contenttype-icon` makes sure the element is style for that and get the
default Content Type icon. The second class is specific to the Content Type
based on its identifier and if it's defined in one of the CSS file, the element
will get the custom Content Type icon defined there.

## Extensibility

The extensibility is tackled differently depending on the use case but it relies
on the ability to embed a custom CSS file in PlatformUI with `css.yml`.

Also to even prevent the need to configure/extend the system, we should provide
several pre-configured icons for very common Content Types like:

* `product`
* `author`
* `category`
* `gallery` / `portfolio`
* `blog_post` / `blogpost` / `post`
* `blog` / `weblog`
* `news`
* `pdf`
* `document`
* `photo`
* `comment`
* `wiki`
* `wiki_page` / `wikipage`


### Pick an icon for a custom Content Type in existing icons

In that case, you need to pick the icon code. For that, [the icomoon
application](https://icomoon.io/app/) can be used until the UI guideline is up
to date and references the available icons. To ease that process and the
readability of the code, we'll use ligatures in the font icon so that the CSS
code for a custom Content Type could look like:

```css
/* in a custom CSS file included with `css.yml` */

.ez-contenttype-icon-mycontenttypeidentifier:before {
    content: "product"; /* because this icon matches the usage of such content
    items */
}

```

### Adding customs icons

If the icons we provide do not fit for a custom Content Type, then a new custom
icon font has to be added. To generate the icon, the Icomoon App can be used (or
any other tool), then with a custom CSS stylesheet, this font can be included
and the `ez-contenttype-icon-<content type identifier>` can be configured to use
that font.

Example:

```css
/* in a custom CSS file included with `css.yml` */

@font-face {
    font-family: 'my-icon-font';
    src:url('../../fonts/my-icon-font.eot');
    src:url('../../fonts/my-icon-font.eot?#iefix') format('embedded-opentype'),
        url('../../fonts/my-icon-font.woff') format('woff'),
        url('../../fonts/my-icon-font.ttf') format('truetype'),
        url('../../fonts/my-icon-font.svg#my-icon-font') format('svg');
    font-weight: normal;
    font-style: normal;
}

.ez-contenttype-icon-myidentifier:before {
    font-family: 'my-icon-font';
    content: "myiconcode";
}

/* repeated as many times as needed for each custom content type */
```

### Completely override the icon set

The solution to solve that use case is very close to the previous one. A custom
icon font will have to be produced and then with a custom CSS file this one
should be loaded and then the `ez-contenttype-icon` style has to be changed to
use that new font.

Example:

```css
/* in a custom CSS file included with `css.yml` */
@font-face {
    font-family: 'my-icon-font';
    src:url('../../fonts/my-icon-font.eot');
    src:url('../../fonts/my-icon-font.eot?#iefix') format('embedded-opentype'),
        url('../../fonts/my-icon-font.woff') format('woff'),
        url('../../fonts/my-icon-font.ttf') format('truetype'),
        url('../../fonts/my-icon-font.svg#my-icon-font') format('svg');
    font-weight: normal;
    font-style: normal;
}

.ez-contenttype-icon:before {
    font-family: 'my-icon-font'; /* replaces ez-platformui-icomoon */
    /* no further change needed if the custom icon font uses the same
     * codes/ligatures
     */
}
```
