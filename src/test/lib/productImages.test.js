import { describe, it, expect } from 'vitest';
import { mainImage, galleryImages, bannerImage } from '@/lib/productImages.js';

const mainImg = { id: 1, name: 'main', url: 'https://s3.test/main.jpg', alt: '', role: 'main' };
const galleryOne = {
  id: 2,
  name: 'dish',
  url: 'https://s3.test/dish.jpg',
  alt: 'dish',
  role: 'gallery',
};
const galleryTwo = {
  id: 3,
  name: 'reading',
  url: 'https://s3.test/reading.jpg',
  alt: 'reading',
  role: 'gallery',
};
const banner = {
  id: 4,
  name: 'story',
  url: 'https://s3.test/story.jpg',
  alt: 'story',
  role: 'banner',
};
const other = {
  id: 5,
  name: 'stone',
  url: 'https://s3.test/stone.jpg',
  alt: 'stone',
  role: 'other',
};

const product = { id: 1, images: [mainImg, galleryOne, galleryTwo, banner, other] };

describe('mainImage', () => {
  it('returns the image with role main', () => {
    expect(mainImage(product)).toBe(mainImg);
  });

  it('returns undefined when the product has no main image', () => {
    expect(mainImage({ id: 2, images: [galleryOne] })).toBeUndefined();
  });

  it('returns undefined for a missing product', () => {
    expect(mainImage(null)).toBeUndefined();
    expect(mainImage(undefined)).toBeUndefined();
  });

  it('returns undefined for a product with no images array', () => {
    expect(mainImage({ id: 3 })).toBeUndefined();
  });
});

describe('galleryImages', () => {
  it('returns every image with role gallery, in the order given', () => {
    expect(galleryImages(product)).toEqual([galleryOne, galleryTwo]);
  });

  it('returns an empty array when the product has no gallery images', () => {
    expect(galleryImages({ id: 2, images: [mainImg] })).toEqual([]);
  });

  it('returns an empty array for a missing product', () => {
    expect(galleryImages(null)).toEqual([]);
    expect(galleryImages(undefined)).toEqual([]);
  });

  it('returns an empty array for a product with no images array', () => {
    expect(galleryImages({ id: 3 })).toEqual([]);
  });
});

describe('bannerImage', () => {
  it('returns the image with role banner', () => {
    expect(bannerImage(product)).toBe(banner);
  });

  it('returns undefined when the product has no banner image', () => {
    expect(bannerImage({ id: 2, images: [mainImg] })).toBeUndefined();
  });

  it('returns undefined for a missing product', () => {
    expect(bannerImage(null)).toBeUndefined();
  });
});
