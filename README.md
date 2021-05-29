# Bottlejack: A static site generator

Do you want to build a portfolio? *Sure, we all do.*

Bottlejack can take all kinds of content and turn it into a perfectly customizable static website. Right now it can only take in Google Docs, but who knows what the future holds?

## Installation

```
npm install -g bottlejack
```

## Usage

For setup options, look at docs on [portfolio-autopublish](https://github.com/jsoma/portfolio-autopublish).

File structure should look something like this:

```
|-- data.yaml
|-- templates
|    |-- home.hbs
|    +-- page.hbs
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
