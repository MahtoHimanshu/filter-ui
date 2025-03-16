# Filter System with Searchable Dropdowns

## Overview
This React-based **Filter System** allows users to add dynamic filters based on different categories such as **Dimensions, Tags, and Metrics**. It includes:
- A **searchable filter dropdown** for selecting categories.
- **Searchable dropdowns** for tag values.
- Support for **logical operators (AND/OR)** between multiple filters.
- **Dynamic condition selection** based on the selected category.

## Features
✔ **Searchable filter dropdown** for easy category selection.  
✔ **Searchable tag value dropdown** for quick value selection.  
✔ **Supports multiple filters** dynamically.  
✔ **Logical AND/OR operations** between filters.  
✔ **Real-time updates** based on selected filters.  
✔ **Responsive UI** with a clean layout.

## Installation
Make sure you have **Node.js** and **React** installed in your project. Then, follow these steps:

1. Clone the repository or add the component to your project.
2. Install dependencies (if any):
   ```sh
   npm install
   ```
3. Import and use the component:
   ```jsx
   import FilterSystem from "./FilterSystem";

   function App() {
       return (
           <div>
               <h1>Filter System</h1>
               <FilterSystem />
           </div>
       );
   }

   export default App;
   ```

## Usage
1. Click on the **"Add Filters"** button to open the filter dropdown.
2. **Search and select** a category from Dimensions, Tags, or Metrics.
3. Choose an **operator** (e.g., Equals, Contains, Greater than).
4. If the category is a **tag**, you can search within its values before selecting one.
5. Add multiple filters and define their **AND/OR logic**.
6. Click the **delete icon (🗑)** to remove a filter.

## Filter Categories & Conditions
- **Dimensions:** Width, Height, Depth.
- **Tags:** Character, Background, Elements, CTA Position, CTA Text.
- **Metrics:** Spends, Clicks, Views.

Operators vary based on the category type:
- **Metrics:** Equals, Lesser than, Greater than.
- **Tags:** is, is not, contains, does not contain.

## Technologies Used
- **React.js** – for the interactive UI.
- **CSS** – for styling.
- **React Icons (FaTrash)** – for the delete button.

## Future Enhancements
- Integrate with an **API** to fetch dynamic tag values.
- Support for **date-based filters**.
- Enhanced **UI animations and transitions**.

## License
This project is open-source and available under the **MIT License**.

---

### Made with ❤️ in React.js 🚀

