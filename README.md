<!--
  SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
  SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Furry identification generators

> A collection of models as classes to represent [ICAO 9303 Machine-Readable Travel Documents (MRTDs)][icao9303] and example renderers to create furry-themed MRTDs.

[![REUSE status](https://api.reuse.software/badge/github.com/sentamalin/alfa-id-generator)](https://api.reuse.software/info/github.com/sentamalin/alfa-id-generator)

* [Demos](#demos)
* [Provided classes](#provided-classes)
* [Licenses](#licenses)

## Demos

[Air Line Furries Association, International][alfa], provides [generators](https://generator.airlinefurries.com) to create furry-themed travel documents to save as an image or print:

* [Crewmember Certificate](https://generator.airlinefurries.com/crew-certificate/)
* [Crewmember Identification Badge](https://generator.airlinefurries.com/crew-id/)
* [Crewmember License](https://generator.airlinefurries.com/crew-license/)
* [Events Passport](https://generator.airlinefurries.com/events-passport/)
* [Events Visa (MRV-A)](https://generator.airlinefurries.com/events-mrva/)
* [Events Visa (MRV-B)](https://generator.airlinefurries.com/events-mrvb/)
* [Events Visa (Digital Seal)](https://generator.airlinefurries.com/events-seal/)

## Provided classes

Four kinds of classes are available for your use, modification, and study: classes used for composition, examples of composed classes, canvas renderers, and web page controllers. Their descriptions, properties, and methods are documented in their respective files using [JSDoc][jsdoc].

### Classes used for composition

These classes are found in `/lib/icao9303/` and are mainly used to compose other kinds of documents:

* `DigitalSeal` - Properties common to all visible digital seals (VDS).
* `DigitalSealV3` - A digital seal conforming to VDS version 3.
* `DigitalSealV4` - A digital seal conforming to VDS version 4.
* `TravelDocument` - Properties common to all travel documents.
* `VisaDocument` - Properties common to all visa documents.

### Composed classes

These classes are found in `/lib/icao9303/` and may be used as-is or used to compose other kinds of documents:

* `MRVADocument` - A class that represents a nearly full-page machine-readable visa sticker (MRV-A).
* `MRVBDocument` - A class that represents a smaller machine-readable visa sticker (MRV-B) for when a clear area aside the visa is needed on a passport page.
* `TD1Document` - A class that represents a machine-readable official travel document (MROTD) in the ISO/IEC 7810 TD1 size (like a credit card).
* `TD2Document` - A class that represents a MROTD in the ISO/IEC 7810 TD2 size (like the Icelandic identity card before December 2023).
* `TD3Document` - A class that represents a MROTD in the ISO/IEC 7810 TD3 size (like a passport booklet).

These classes are found in `/lib/`:

* `CrewCertificate` - A class composed from `TD1Document` and `DigitalSealV4` that represents a furry crewmember certificate in the TD1 size with a VDS.
* `CrewID` - A class composed from `TD1Document` and `DigitalSealV4` that represents a furry crewmember identification badge in the TD1 size with a VDS.
* `CrewLicense` - A class composed from `TD1Document` and `DigitalSealV4` that represents a furry crewmember license in the TD1 size with a VDS.
* `EventsMRVA` - A class composed from `MRVADocument` and `DigitalSealV4` that represents a full-page MRV-A with a VDS used for furry events.
* `EventsMRVB` - A class composed from `MRVBDocument` and `DigitalSealV4` that represents a smaller MRV-B with a VDS used for furry events.
* `EventsPassport` - A class composed from `TD3Document` and `DigitalSealV4` that represents a furry events passport booklet used to identify furries and store their visa stickers, entry stamps, and other information.

### Canvas renderers

Seven renderers are provided in respective directories for the six composed classes found in `/lib/`:

* `CrewCertificateRenderer` - Given a `CrewCertificate`, renders both sides of a furry crewmember certificate with full bleed.
* `CrewIDRenderer` - Given a `CrewID`, renders both sides of a furry crewmember identification badge with full bleed.
* `CrewLicenseRenderer` - Given a `CrewLicense`, renders both sides of a furry crewmember license with full bleed.
* `EventsMRVARenderer` - Given an `EventsMRVA`, renders the sticker of a MRV-A furry events visa with full bleed.
* `EventsMRVBRenderer` - Given an `EventsMRVB`, renders the sticker of a MRV-B furry events visa with full bleed.
* `EventsPassportRenderer` - Given an `EventsPassport`, renders the machine-readable passport page and signature page of a furry events passport with full bleed.
* `EventsSealRenderer` - Given an `EventsMRVB`, renders an MRV-B furry events visa into a small sticker containing a VDS with full bleed.

Each of these renderers take an instance of their respective class and use a canvas rendering context to render the instance as images. The images are suitable for web use or for printing at 300-dpi.

Note that renderers are scenario-specific and these renderers were designed for a web demonstration in mind. Ergo, many renderer properties are configurable. In real-world scenarios where a document's data may be filled, then digitally signed, then rendered, then printed, few or no properties may want to be configurable.

### Web page controllers

For each renderer a controller is provided in respective directories to allow setting document and renderer properties when used in a web page: `CrewCertificateViewModel`, `CrewIDViewModel`, `CrewLicenseViewModel`, `EventsMRVAViewModel`, `EventsMRVBViewModel`, `EventsPassportViewModel`, and `EventsSealViewModel`.

Like the renderers, these were designed for a web demonstration in mind. They are not actual view models in the Model-View-ViewModel definition and while functional, they are a bit of a mess to read over. One would certainly want to write something better.

## Licenses

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but **without any warranty**; without even the implied warranty of  **merchantability** or **fitness for a particular purpose**. See the [GNU General Public License][gpl] for more details.

The repository has a copy of the GNU General Public License and you should have received a copy of the License along with this program. If not, see [https://www.gnu.org/licenses/][gplweb].

Additionally, the program is [REUSE-compliant][reuse] and all files contain its licensing information, either directly in the file or in a `.license` file.

### Other code used

[lovasoa][lovasoa]'s [base45 typescript implementation][base45] is used to encode and decode byte arrays and base-45 strings, respectively. It is released under the [Apache License 2.0][apache].

[zeekay][zeekay]'s [qrcode-lite][qrcodeLite] is a fork of [soldair][soldair]'s [node-qrcode][nodeQrcode] and is used by the renderers to create QR codes. It is released under the [MIT License][mit].

### Fonts

[Matthew Hinders-Anderson][matthew]'s [OCR-B][ocrb] is the font used for the Machine-Readable Zones (MRZ) and is released under the [Creative Commons Attribution 4.0 International][cc4] license.

Ascender Fonts's [Open Sans][opensans] was downloaded from FontSquirrel and is the font used for the Visual Inspection Zones (VIZ). It is released under the [Apache License 2.0][apache].

The Astigmatic Typographic Institute's [Yellowtail][yellowtail] was downloaded from FontSquirrel and is the font used to generate signatures from text entered in a textbox. It is released under the [Apache License 2.0][apache].

### Documentation and image assets

Documentation, like this README, is released under the [Creative Commons Attribution Share Alike 4.0 International][cc4sa] license.

[Fox][fox] was taken by Kent Miller and is released under the [Creative Commons Zero 1.0 Universal][cc0] license. The remaining image files used by this program are by [Air Line Furries Association, International][alfa], and are released under the [Creative Commons Attribution 4.0 International][cc4] license.

### `index.html`, `index.css` and `index.js` files

`index.html`, `index.css` and `index.js` files are in respective folders and used to provide a demo web page where one can change composed class and renderer properties. As they are fairly simple, they are released under the [Creative Commons Zero 1.0 Universal][cc0] license.

[alfa]: https://airlinefurries.com/
[apache]: ./LICENSES/Apache-2.0.txt
[base45]: https://github.com/lovasoa/base45-ts
[cc0]: ./LICENSES/CC0-1.0.txt
[cc4]: ./LICENSES/CC-BY-4.0.txt
[cc4sa]: ./LICENSES/CC-BY-SA-4.0.txt
[fox]: https://www.flickr.com/photos/57557144@N06/5302090111
[gpl]: ./LICENSES/GPL-3.0-or-later.txt
[gplweb]: https://www.gnu.org/licenses/
[icao9303]: https://www.icao.int/publications/pages/publication.aspx?docnum=9303
[jsdoc]: https://jsdoc.app/
[lovasoa]: https://github.com/lovasoa
[matthew]: https://wehtt.am/
[mit]: ./LICENSES/MIT.txt
[nodeQrcode]: https://github.com/soldair/node-qrcode
[ocrb]: https://web.archive.org/web/20190328165040/https://wehtt.am/ocr-b/
[opensans]: https://www.fontsquirrel.com/fonts/open-sans
[qrcodeLite]: https://github.com/zeekay/qrcode-lite
[reuse]: https://reuse.software/
[soldair]: https://github.com/soldair
[yellowtail]: https://www.fontsquirrel.com/fonts/yellowtail
[zeekay]: https://github.com/zeekay
