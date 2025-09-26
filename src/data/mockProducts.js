// Mock data za testiranje bez MongoDB-a
const mockProducts = [
  {
    _id: '1',
    title: 'Aluminijumski prozorski sistem ALU-PRO-001',
    description: 'Vrhunski aluminijumski prozorski sistem sa termoprekidom. Idealan za stambene i komercijalne objekte. Omogućava maksimalnu energetsku efikasnost.',
    gallery: [
      {
        url: '/images/product1.jpg',
        publicId: 'nissal/products/alu-pro-001-1',
        alt: 'ALU-PRO-001 prozorski sistem',
        isMain: true
      },
      {
        url: '/images/product2.jpg',
        publicId: 'nissal/products/alu-pro-001-2',
        alt: 'ALU-PRO-001 detalj',
        isMain: false
      }
    ],
    measurements: [
      {
        size: 'Standard',
        dimensions: {
          length: 1200,
          width: 800,
          height: 60,
          weight: 2.5
        }
      },
      {
        size: 'Large',
        dimensions: {
          length: 1500,
          width: 1000,
          height: 60,
          weight: 3.2
        }
      }
    ],
    catalog: {
      catalogNumber: 'ALU-PRO-001',
      tags: ['aluminum', 'prozor', 'energetska-efikasnost', 'termoprekid']
    },
    colors: [
      {
        name: 'Bela',
        hexCode: '#FFFFFF',
        available: true
      },
      {
        name: 'Antracit',
        hexCode: '#2F3437',
        available: true
      },
      {
        name: 'Zlatni hrast',
        hexCode: '#B8860B',
        available: true
      }
    ],
    sizes: [
      {
        name: 'Standard',
        code: 'STD',
        available: true
      },
      {
        name: 'Large',
        code: 'LRG',
        available: true
      },
      {
        name: 'XL',
        code: 'XL',
        available: false
      }
    ],
    price: {
      amount: 25000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 50
    },
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-07-20')
  },
  {
    _id: '2',
    title: 'Aluminijumska vrata sistem ALU-DOOR-002',
    description: 'Moderna aluminijumska vrata za ulazne prostorije. Visoka sigurnost i izolacija. Idealna za poslovne objekte.',
    gallery: [
      {
        url: '/images/product3.jpg',
        publicId: 'nissal/products/alu-door-002-1',
        alt: 'ALU-DOOR-002 vrata sistem',
        isMain: true
      }
    ],
    measurements: [
      {
        size: 'Standard',
        dimensions: {
          length: 2100,
          width: 900,
          height: 80,
          weight: 45
        }
      }
    ],
    catalog: {
      catalogNumber: 'ALU-DOOR-002',
      category: 'Vrata sistemi',
      subcategory: 'Ulazna vrata',
      tags: ['aluminum', 'vrata', 'sigurnost', 'izolacija']
    },
    colors: [
      {
        name: 'Crna',
        hexCode: '#000000',
        available: true
      },
      {
        name: 'Siva',
        hexCode: '#808080',
        available: true
      }
    ],
    sizes: [
      {
        name: 'Standard',
        code: 'STD',
        available: true
      }
    ],
    price: {
      amount: 85000,
      currency: 'RSD'
    },
    availability: {
      inStock: true,
      quantity: 15
    },
    isActive: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-07-18')
  },
  {
    _id: '3',
    title: 'Fasadni aluminijumski sistem ALU-FAC-003',
    description: 'Napredni fasadni sistem za moderne zgrade. Omogućava kreiranje impresivnih staklenih fasada sa maksimalnom funkcionalnosti.',
    gallery: [
      {
        url: '/images/product4.jpg',
        publicId: 'nissal/products/alu-fac-003-1',
        alt: 'ALU-FAC-003 fasadni sistem',
        isMain: true
      }
    ],
    measurements: [
      {
        size: 'Modularni',
        dimensions: {
          length: 3000,
          width: 1500,
          height: 150,
          weight: 8.5
        }
      }
    ],
    catalog: {
      catalogNumber: 'ALU-FAC-003',
      category: 'Fasadni sistemi',
      subcategory: 'Strukturalne fasade',
      tags: ['aluminum', 'fasada', 'modularan', 'staklo']
    },
    colors: [
      {
        name: 'Prirodni aluminijum',
        hexCode: '#C0C0C0',
        available: true
      },
      {
        name: 'Bronza',
        hexCode: '#CD7F32',
        available: true
      }
    ],
    sizes: [
      {
        name: 'Modularni',
        code: 'MOD',
        available: true
      }
    ],
    price: {
      amount: 180000,
      currency: 'RSD'
    },
    availability: {
      inStock: false,
      quantity: 0
    },
    isActive: true,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-07-15')
  }
];

// Helper funkcije za mock podatke
const getMockProducts = (filters = {}) => {
  let filteredProducts = [...mockProducts];
  
  // Filter po kategoriji
  if (filters.category) {
    filteredProducts = filteredProducts.filter(p => 
      p.catalog.category.toLowerCase().includes(filters.category.toLowerCase())
    );
  }
  
  // Filter po bojama
  if (filters.colors && filters.colors.length > 0) {
    filteredProducts = filteredProducts.filter(p =>
      p.colors.some(color => 
        filters.colors.some(filterColor => 
          color.name.toLowerCase().includes(filterColor.toLowerCase())
        )
      )
    );
  }
  
  // Filter po veličinama
  if (filters.sizes && filters.sizes.length > 0) {
    filteredProducts = filteredProducts.filter(p =>
      p.sizes.some(size => 
        filters.sizes.some(filterSize => 
          size.name.toLowerCase().includes(filterSize.toLowerCase())
        )
      )
    );
  }
  
  // Filter po ceni
  if (filters.minPrice || filters.maxPrice) {
    filteredProducts = filteredProducts.filter(p => {
      const price = p.price.amount;
      if (filters.minPrice && price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && price > parseFloat(filters.maxPrice)) return false;
      return true;
    });
  }
  
  // Filter po dostupnosti
  if (filters.inStock === 'true') {
    filteredProducts = filteredProducts.filter(p => 
      p.availability.inStock && p.availability.quantity > 0
    );
  }
  
  // Pretraga
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.catalog.catalogNumber.toLowerCase().includes(searchTerm) ||
      p.catalog.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Sortiranje
  if (filters.sortBy) {
    filteredProducts.sort((a, b) => {
      let aValue, bValue;
      
      if (filters.sortBy === 'price.amount') {
        aValue = a.price.amount;
        bValue = b.price.amount;
      } else if (filters.sortBy === 'title') {
        aValue = a.title;
        bValue = b.title;
      } else {
        aValue = a.createdAt;
        bValue = b.createdAt;
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue < bValue ? -1 : 1;
      }
    });
  }
  
  return filteredProducts;
};

const getMockCategories = () => {
  return [...new Set(mockProducts.map(p => p.catalog.category))];
};

const getMockColors = () => {
  const colors = [];
  mockProducts.forEach(p => {
    p.colors.forEach(color => {
      if (!colors.find(c => c.name === color.name)) {
        colors.push({
          name: color.name,
          hexCode: color.hexCode
        });
      }
    });
  });
  return colors.sort((a, b) => a.name.localeCompare(b.name));
};

const getMockSizes = () => {
  const sizes = [];
  mockProducts.forEach(p => {
    p.sizes.forEach(size => {
      if (!sizes.find(s => s.code === size.code)) {
        sizes.push({
          name: size.name,
          code: size.code
        });
      }
    });
  });
  return sizes.sort((a, b) => a.name.localeCompare(b.name));
};

module.exports = {
  mockProducts,
  getMockProducts,
  getMockCategories,
  getMockColors,
  getMockSizes
};