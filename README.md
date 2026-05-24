# 🖼️ Illustrator Grid Collage Generator

An Adobe Illustrator ExtendScript (`.jsx`) that automatically arranges any number of selected images or objects into a balanced, proportional grid layout within a specified canvas area using dynamic recursive binary splitting. 

It mimics modern web layout behavior (`object-fit: cover`) by scaling and auto-clipping assets to perfectly fill their calculated cells with minimal cropping.

---

## ✨ Features

* **📐 Proportional Aspect-Ratio Matching:** Matches your images to grid cells with the closest aspect ratio to minimize cropping.
* **🌿 Smart Recursive Splitting:** Automatically handles any arbitrary number of selected items, splitting the bounding area dynamically based on available dimensions.
* **📏 Precise Padding & Dimensions:** Accepts real-world measurements (cm) for canvas dimensions and gaps between images.
* **✂️ Auto-Clipping:** Centers images within cells and applies an active vector clipping mask.
* **🎯 Automatic Artboard Centering:** Centers the final composite collage perfectly on your active artboard.

---

## ⚙️ How It Works

1. **📥 Input Parameters:** The script prompts for total layout width, height, and desired inner padding.
2. **🔄 Recursive Partitioning:** It uses a binary space partitioning algorithm. It examines the aspect ratio of the remaining space and splits it either vertically or horizontally depending on whether width or height is dominant.
3. **📊 Optimization Sort:** Grid cells and images are sorted by aspect ratio. The narrowest images are placed into the narrowest cells, and the widest images into the widest cells.
4. **🔍 Scale & Mask:** Images are scaled up to fully cover the cell area (`object-fit: cover`), centered, and enclosed within a vector clipping mask.
5. **📍 Centering:** The entire finished layout group shifts to center itself relative to the active artboard coordinates.

---

## 🚀 Installation & Usage

### 📋 Prerequisites
* Adobe Illustrator (CC or later recommended)
* Selected raster images or vector objects on your canvas

### 🛠️ Execution Steps

1. **🖱️ Select Objects:** Open your Illustrator document and select all the images or vector objects you want to include in the collage.
2. **🖥️ Run Script:**
   * Go to `File` > `Scripts` > `Other Script...`
   * Choose the `GridCollageGenerator.jsx` file.
   * *(Alternative)* Drop the file into your Illustrator installation folder under `Presets/[Your Language]/Scripts` and restart Illustrator to find it in the `File > Scripts` menu.
3. **⌨️ Configure Layout:** Enter the requested parameters into the dialog boxes:
   * **Total Width** (in cm)
   * **Total Height** (in cm)
   * **Padding** gap between objects (in cm)

> 💡 **Note:** The script filters out empty objects or items with `0` width/height properties automatically.

---

## 💻 Code Highlight

The layout engine uses recursive area subdivision to calculate cell matrices dynamically:

```javascript
if (w > h) {
    // Vertical split (Left / Right)
    var w1 = (w - padding) * ratio;
    var w2 = w - padding - w1;
    subdivide(x, y, w1, h, count1);
    subdivide(x + w1 + padding, y, w2, h, count2);
} else {
    // Horizontal split (Top / Bottom)
    var h1 = (h - padding) * ratio;
    var h2 = h - padding - h1;
    subdivide(x, y, w, h1, count1);
    subdivide(x, y - h1 - padding, w, h2, count2);
}
