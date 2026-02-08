import React from 'react';

const categories = [
    { id: 'animals', name: 'Animals' },
    { id: 'nature', name: 'Nature' },
    { id: 'vehicles', name: 'Vehicles' },
    { id: 'characters', name: 'Characters' },
];

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
    return (
        <div className="category-filter">
            <h3>Select a Category</h3>
            <ul>
                {categories.map(category => (
                    <li key={category.id}>
                        <button
                            className={selectedCategory === category.id ? 'active' : ''}
                            onClick={() => onCategoryChange(category.id)}
                        >
                            {category.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryFilter;