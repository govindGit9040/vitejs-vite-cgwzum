const apiURL = 'https://fakestoreapi.com/products';

let productList = [];
let displayedProducts = [];
let filteredProducts = [];
let currentIndex = 10;
const itemsPerPage = 10;

const productListArea = document.getElementById('product-grid-area');
const shimmerWrapper = document.getElementById('shimmer-wrapper');
const productCount = document.getElementById('result-count');
const sortingDropdown = document.getElementById('sortingProducts');
const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
const loadMoreBtn = document.getElementById('load-more-btn');
const searchBar = document.getElementById('search-by-title');

async function fetchData() {
  try {
    const response = await fetch(apiURL);
    console.log(response);

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} - ${response.statusText}`
      );
    }
    const data = await response.json();
    console.log(data);

    if (!data || data.length === 0) {
      throw new Error('No data found');
    }
    // Call showShimmer() when you start fetching data
    hideShimmer();

    productList = data;
    // copy all products ============
    filteredProducts = productList.slice();
    // saved 10 products ============
    displayedProducts = filteredProducts.slice(0, itemsPerPage);
    // showing 10 products on load by calling function to load in html using DOM selection ============
    displayProducts(displayedProducts);

    // Added event listner to get products for the select category ==============
    categoryCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', filterProductsByCategory);
    });

    // Added event listner to sort products as per the selection  ==============
    sortingDropdown.addEventListener('change', () => sortAndDisplay());

    // Added event listner to load remaining products ==============
    loadMoreBtn.addEventListener('click', loadMoreProducts);

    // Added event listner search for product on title
    searchBar.addEventListener('input', searchProducts);
  } catch (error) {
    // we are handling error with proper message to show the exact error cause by calling this function
    handleError(error);
  }
}

// Function to show shimmer
function showShimmer() {
  shimmerWrapper.style.display = 'grid';
  productListArea.style.display = 'block';
}
// Function to hide shimmer and show products
function hideShimmer() {
  shimmerWrapper.style.display = 'none';
  productListArea.style.display = 'grid';
}
// Call showShimmer() when you start fetching data
showShimmer();

function displayProducts(products) {
  productListArea.innerHTML = products.map(createProductHTML).join('');
  productCount.innerText = filteredProducts.length;

  // Toggle Load More button visibility
  loadMoreBtn.style.display =
    currentIndex >= filteredProducts.length ? 'none' : 'block';
}

function createProductHTML(product) {
  return `<div class="single-product">
    <div class="product-image">
      <img src="${product.image}" alt="${product.title}" />
    </div>
    <div class="product-title">${product.title}</div>
    <div class="product-price">
        $${product.price}
        <div class="wishlist-icon"><svg width="16" height="16" fill="currentColor" class="bi bi-suit-heart" viewBox="0 0 16 16">
        <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.6 7.6 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z"></path>
        </svg></div>
    </div>
    <div class="product-description">${product.description}</div>
  </div>`;
}

function filterProductsByCategory() {
  const selectedCategories = Array.from(categoryCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.name);
  searchBar.value = '';
  filteredProducts = productList.filter((product) =>
    selectedCategories.length > 0
      ? selectedCategories.includes(product.category)
      : true
  );

  currentIndex = itemsPerPage;
  displayedProducts = filteredProducts.slice(0, currentIndex);

  sortAndDisplay();
}

function sortAndDisplay() {
  const sortOrder = sortingDropdown.value;

  // Sort the filteredProducts list based on the selected order
  sortProducts(sortOrder);

  // Reset the displayedProducts based on the currentIndex after sorting
  displayedProducts = filteredProducts.slice(0, currentIndex);

  displayProducts(displayedProducts);
}

function searchProducts() {
  const inputTitle = searchBar.value.toLowerCase();
  //all checkbox unchecked
  categoryCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  // Filter products based on the search inputTitle
  filteredProducts = productList.filter(
    (product) => product.title.toLowerCase().includes(inputTitle)
    // ||
    //   product.description.toLowerCase().includes(inputTitle)
  );

  // Reset currentIndex and displayedProducts based on the search results
  currentIndex = itemsPerPage;
  displayedProducts = filteredProducts.slice(0, currentIndex);

  // Update the display with the searched products
  displayProducts(displayedProducts);

  // Adjust the visibility of the Load More button based on the results
  loadMoreBtn.style.display =
    filteredProducts.length > currentIndex ? 'block' : 'none';
}

function sortProducts(order) {
  if (order === 'lowToHigh') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (order === 'highToLow') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (order === 'AtoZ') {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  } else if (order === 'ZtoA') {
    filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
  }
}

function loadMoreProducts() {
  currentIndex += itemsPerPage;
  displayedProducts = filteredProducts.slice(0, currentIndex);

  displayProducts(displayedProducts);

  loadMoreBtn.style.display =
    currentIndex >= filteredProducts.length ? 'none' : 'block';
}
// function handleError(error) {
//   console.error("An error occurred:", error);
//   displayErrorMessage(
//     "Something went wrong while fetching data. Please try again later."
//   );
// }

function handleError(error) {
  if (error.name === 'TypeError') {
    console.error('Network error or API not reachable:', error);
    // displayErrorMessage(Network error or API not reachable: ${error});
  } else if (error.message.includes('HTTP error')) {
    console.error('API responded with an error:', error);
    // displayErrorMessage(API responded with an error: ${error});
  } else if (error.message === 'No data found') {
    console.error('API returned no data:', error);
    // displayErrorMessage(API returned no data: ${error});
  } else {
    console.error('An unexpected error occurred:', error);
    // displayErrorMessage(An unexpected error occurred: ${error});
  }

  displayErrorMessage(
    'Something went wrong while fetching data. Please try again later.'
  );
}

function displayErrorMessage(message) {
  productCount.innerText = 0;
  productListArea.innerHTML = `<div class="error-message">${message}</div>`;
}

// Initialize product fetching

setTimeout(() => {
  // Call showShimmer() when you start fetching data
  fetchData();
}, 2000);
