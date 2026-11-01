# Rachel’s Family Tree

Family history for the Johnson, Nelton, Bell and Rivers families, with an interactive tree, surname collections, regional place pages, stories, a searchable photograph gallery and a timeline.

Published at https://srmcno.github.io/rachel/. This is a public GitHub Pages site. Search engines are asked not to index it; that does not provide access control. Living profiles show names and relationships only.

Serve locally with `python3 -m http.server 8766` from this folder and open http://localhost:8766/. No build or dependencies are needed. Saved stories and reading size stay in the current browser; the site explains when storage is unavailable.

Run data checks with `python3 -m unittest discover -s tests -v`. Published data lives in `tree.json` and `content.json`; the private GEDCOM and original research files stay outside this public repository. The authoring copy is at `~/nelton-roots-work` on the Mac. After editing, keep its `content.json` and `devsite/index.html` synchronized with this site.

The home page and core navigation are in `index.html` and `home.css`. Family/place collections use `explore.js` and `explore.css`; photograph browsing uses `gallery.js` and `gallery.css`. Publish these files together. The private `devsite` preview uses symbolic links to these collection assets. Story topics are curated from existing story IDs; no new biographical claims are inferred by the collection views.
