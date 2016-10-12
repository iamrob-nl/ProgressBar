# ProgressBar

This Mendix widget shows a round progressbar.

The progressbar consists of a SVG object, manipulated with the use of Javascript and the Velocity.js library for animations. Alongside the round progressbar, there is also a horizontal progressbar. Both animate from zero to a given percentage of completeness.

This project is build upon the Mendix widget boilerplate and contains a Mendix testproject with implementations.

## Configurable

Both widgets come with the same configurable options. These are:
- Display value (boolean).
- Value (number attribute).
- Display second line (boolean).
- Second line text (string attribute).
- Arch/line color of the progressbar (string attribute).
- Stroke width (integer attribute). The configuration supports a range between 1 and 10.
