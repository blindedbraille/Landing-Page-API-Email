# FORM. Gallery

A responsive static website for FORM., an independent experimental art gallery concept.

## About FORM.

FORM. is a fictional gallery concept focused on presenting contemporary and experimental art in unconventional spaces across Toronto.

## After the Light

*After the Light* explores light, movement, space, and perception through experimental light painting and long-exposure photography.

## Features

- Hero artwork carousel with captions and manual controls
- Animated Selected Works carousel
- Interactive featured artist previews
- Expandable About FORM. information
- Newsletter and subscription forms powered by EmailJS
- Responsive layouts, keyboard support, and reduced-motion handling
- Cursor glow effect on supported pointer devices

## Technologies

- HTML5, CSS3, and vanilla JavaScript
- Manrope via Google Fonts
- EmailJS browser SDK
- GitHub Pages

## Project Structure

```text
Landing-Page-API-Email/
├── index.html
├── styles.css
├── script.js
├── images/
├── README.md
└── .gitignore
```

## Run Locally

Open the project folder in Visual Studio Code and run `index.html` with Live Server, or start a local server from the project directory:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Live Website

[FORM. on GitHub Pages](https://blindedbraille.github.io/Landing-Page-API-Email/)

## EmailJS

The browser-safe EmailJS public key is configured in `index.html`; the service and template IDs are used in `script.js`. Do not put private keys, passwords, or access tokens in client-side code.

## Photography Credits and Licensing

The project files do not include photographer, source, or license records for the images in `images/`. Verify usage permissions and add creator credits and license links from the original sources where available.
