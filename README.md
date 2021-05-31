# Bottlejack: A static site generator

Do you want to build a portfolio? *Sure, we all do.*

Bottlejack can take all kinds of content and turn it into a perfectly customizable static website. Right now it can only take in Google Docs, but who knows what the future holds?

## Installation

```
npm install -g bottlejack
```

### Updating

```
npm update -g bottlejack
```

## Usage

File structure should look something like this:

```
|-- data.yaml
|-- templates
|    |-- home.hbs
|    +-- gdoc.hbs
|    +-- html.hbs
|-- static
     |-- style.css (or whatever)
```

Using that, you can run the command...

```
bottlejack
```

And it'll spit everything into `docs` for you. You can also customize a bit.

```
bottlejack \
    --templates templates \
    --static static \
    --data data.yaml
```

## Using `data.yaml`

Let's start by looking at an **example `data.yaml`**:

```yaml
name: Jonathan Soma
bio: Here is a bio
links:
  - target: mailto:jonathan.soma@gmail.com
    text: 📧 email
  - target: https://jonathansoma.com
    text: 🏠 homepage
  - target: https://twitter.com/dangerscarf
    text: '@dangerscarf'
pages:
  - type: gdoc
    title: this is the first project
    slug: first-project
    url: https://docs.google.com/document/d/126LLa_EKG_nBbmA53HCG3pMVbjKBRnQWJWDL9FUSmHo/edit?usp=sharing
  - type: html
    title: this is the third project
    template: html_bootstrap
    slug: third-project
    filepath: content/sample-page.html
```

### The homepage

Everything in the `data.yaml` page gets fed to the `home.hbs` template, creating a homepage. For example, the `bio` key in the YAML turns into `{{ bio }}` in the template, and `links` get looped through with the `{{#each links}}` section.

Feel free to add whatever you'd like to `data.yaml`, as all of it will be available in the same way in your template.

### All of the pages

Each and every one of the `pages` gets turned into a ..... separate page.

|Key|Meaning|Notes|
|---|---|---|
|`type`|Determines how the rest is processed|Allowed values are `gdoc` for an ArchieML-formatted Google Doc and `html` for raw HTML. *Required*|
|`title`|Link content on homepage, and fills in `{{ title }}` on template pages|*Required*|
|`slug`|The URL the page will be displayed at|*Required*|
|`template`|Which `.hbs` file the page should render using. By default, it uses a template with the same name as `type`.|*Optional*|
|`filepath`|Path to HTML file to import to page|Relative to `data.yaml`. *Only for `html` types*|
|`url`|Path to published Google Doc|*Only for `gdoc` types*|

You're free to add other keys and have them be available in the template. For example, you could add a `published_at` to each page and then have a `{{ published_at }}` available in your template.

## Publishing

Because bottlejack publishes your content into the `/docs` directory, it works out-of-the-box for creating a site using GitHub Pages. It will also work perfectly fine with tools like [Netlify](https://www.netlify.com/).

### A tiny walkthrough for GitHub Pages

After you've run the `bottlejack` command, your content lives in `/docs`. Let's turn it into a GitHub Pages site!

Make sure you've pushed your latest changes to GitHub. Then, from your repository, perform the following navigation steps:

1. **Settings** from the repo top nav
2. **Pages** on the right-hand nav
3. Select **main** from the branch dropdown
4. Select **/docs** from the folder dropdown
5. **Save**

Give it a few minutes and you should have a website published from the content in your `/docs` folder.

To update with any changes, re-run the `bottlejack` command to update `/docs`, then use git to push your updates to the repo. A few minutes later your changes should be visible online.