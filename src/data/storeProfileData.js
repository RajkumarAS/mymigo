// Store Profile Data — Rich Mock Data for Instagram Business Profile
// Provides authentic products (with up to 6 gallery images each),
// high-resolution image posts, and video reels.

export function getStoreProfileData(store) {
  const storeId = store?.id || 'store-kalyani-cotton';
  const handle = store?.handle || 'kalyani_cotton';
  const name = store?.name || 'Kalyani Cotton';
  const city = store?.city || 'Coimbatore';

  // 10 Curated Products across Sarees, Kurtis, 2 Piece, and Daily Wear (each with 6 images)
  const products = [
    {
      id: `${storeId}-prod-1`,
      name: 'Pure Cotton Handloom Saree',
      category: 'Sarees',
      price: '₹1,450',
      originalPrice: '₹2,100',
      discount: '31% OFF',
      deliveryBadge: 'Next Day Delivery',
      rating: 4.9,
      reviewsCount: 142,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Handwoven pure breathable cotton saree with traditional temple zari border. Lightweight, all-day drape comfort direct from master artisans in Coimbatore.',
    },
    {
      id: `${storeId}-prod-2`,
      name: 'Pure Cotton A-Line Festive Kurti',
      category: 'Kurtis',
      price: '₹1,200',
      originalPrice: '₹1,699',
      discount: '29% OFF',
      deliveryBadge: 'Next Day Delivery',
      rating: 4.8,
      reviewsCount: 96,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Rich jewel tone festive kurti with intricate split neckline detailing. 100% natural dyed cotton, tailored for poojas, work wear, and family celebrations.',
    },
    {
      id: `${storeId}-prod-3`,
      name: 'Pastel 2-Piece Kurti & Pant Co-ord Set',
      category: '2 Piece',
      price: '₹1,850',
      originalPrice: '₹2,499',
      discount: '26% OFF',
      deliveryBadge: 'Next Day Delivery',
      rating: 4.9,
      reviewsCount: 88,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Chic 2-piece coordinated outfit featuring a calf-length straight tunic paired with straight-cut ankle trousers with side pocket convenience.',
    },
    {
      id: `${storeId}-prod-4`,
      name: 'Soft Mulmul Floral Cotton Saree',
      category: 'Sarees',
      price: '₹1,299',
      originalPrice: '₹1,850',
      discount: '30% OFF',
      deliveryBadge: 'Next Day Delivery',
      rating: 4.8,
      reviewsCount: 110,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Ultra-soft hand-block printed mulmul saree. Breathable airy drape, ideal for hot tropical weather and casual gatherings.',
    },
    {
      id: `${storeId}-prod-5`,
      name: 'Handloom Embroidered Straight Kurti',
      category: 'Kurtis',
      price: '₹1,350',
      originalPrice: '₹1,899',
      discount: '28% OFF',
      deliveryBadge: 'Next Day Delivery',
      rating: 4.7,
      reviewsCount: 74,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Refined hand-embroidery over fine count pure cotton fabric. Elegantly tailored three-quarter sleeves with contrast piped hem.',
    },
    {
      id: `${storeId}-prod-6`,
      name: 'Festive Chanderi 2-Piece Tunic Set',
      category: '2 Piece',
      price: '₹2,100',
      originalPrice: '₹2,899',
      discount: '27% OFF',
      deliveryBadge: 'Next Day Delivery',
      rating: 4.9,
      reviewsCount: 65,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Lustrous chanderi cotton 2-piece set with subtle golden motifs, complemented by semi-elasticated cigarette pants.',
    },
    {
      id: `${storeId}-prod-7`,
      name: 'Coimbatore Zari Border Handloom Saree',
      category: 'Sarees',
      price: '₹1,850',
      originalPrice: '₹2,600',
      discount: '29% OFF',
      deliveryBadge: 'Next Day Delivery',
      rating: 4.9,
      reviewsCount: 153,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Authentic Coimbatore loom weave featuring intricate zari pallu and matching unstitched blouse piece. A staple heritage drape.',
    },
    {
      id: `${storeId}-prod-8`,
      name: 'Kalamkari Printed Festive Kurti',
      category: 'Kurtis',
      price: '₹1,150',
      originalPrice: '₹1,599',
      discount: '28% OFF',
      deliveryBadge: 'Next Day Delivery',
      rating: 4.8,
      reviewsCount: 82,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Natural dye hand-block Kalamkari artwork on combed cotton fabric. Flattering straight cut silhouette with side slits.',
    },
    {
      id: `${storeId}-prod-9`,
      name: 'Breathable Organic Cotton Daily Tunic',
      category: 'Daily Wear',
      price: '₹999',
      originalPrice: '₹1,450',
      discount: '31% OFF',
      deliveryBadge: 'Next Day Delivery',
      rating: 4.7,
      reviewsCount: 68,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Effortless round-neck everyday cotton tunic. Washed for maximum softness and shrinkage resistance.',
    },
    {
      id: `${storeId}-prod-10`,
      name: 'Indigo Block Print Casual Kurta',
      category: 'Daily Wear',
      price: '₹1,100',
      originalPrice: '₹1,550',
      discount: '29% OFF',
      deliveryBadge: 'Next Day Delivery',
      rating: 4.8,
      reviewsCount: 79,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Artisanal indigo block print kurta with wooden button accents. Clean silhouette perfect for college or weekend outings.',
    },
  ];

  // Curated Instagram Posts / Dummy Image Gallery
  const posts = [
    {
      id: `${storeId}-post-1`,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      caption: 'Diwali Festive Cotton Sarees fresh off the Coimbatore looms! 🪔 Pure breathable weaves with zari temple borders.',
      likes: '1.2K',
      comments: '84',
    },
    {
      id: `${storeId}-post-2`,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      caption: 'Diwali Special Kurtis Sale! ✨ Starting ₹1,200+. Swipe to explore our festive jewel tones.',
      likes: '2.4K',
      comments: '136',
    },
    {
      id: `${storeId}-post-3`,
      image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
      caption: 'Subtle elegance in handloom mulmul. Perfect for office drapes and family temple visits.',
      likes: '890',
      comments: '42',
    },
    {
      id: `${storeId}-post-4`,
      image: 'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
      caption: 'New arrival: 2-Piece coordinated festive sets! Breathable cotton crafted for comfort.',
      likes: '1.5K',
      comments: '77',
    },
    {
      id: `${storeId}-post-5`,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      caption: 'Master artisans weaving our signature motifs in Coimbatore. True loom-to-closet heritage.',
      likes: '3.1K',
      comments: '210',
    },
    {
      id: `${storeId}-post-6`,
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      caption: 'Pastel dream collection! Lightweight Chanderi tunics and festive sets now in store.',
      likes: '960',
      comments: '53',
    },
    {
      id: `${storeId}-post-7`,
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
      caption: 'Direct from our loom shed! Gold zari accents with unbleached organic cotton textures.',
      likes: '1.8K',
      comments: '92',
    },
    {
      id: `${storeId}-post-8`,
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      caption: 'Customer appreciation drape! Thank you for supporting authentic handloom weavers.',
      likes: '1.1K',
      comments: '64',
    },
    {
      id: `${storeId}-post-9`,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      caption: 'Styling festive kurtis with modern straight cuts. Tap Book to reserve your live video slot!',
      likes: '2.0K',
      comments: '115',
    },
  ];

  // Curated Video Reels for the Videos Tab
  const videos = [
    {
      id: 'video-01',
      title: 'Diwali Special Kurtis Sale Starting ₹1,200',
      views: '42.8K',
      duration: '0:55',
      poster: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      videoUrl: './uploads/diwali_sale_kurtis.mp4',
    },
    {
      id: 'video-02',
      title: 'Pure Handloom Cotton Saree Drapes & Styling',
      views: '28.4K',
      duration: '0:48',
      poster: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
      videoUrl: './uploads/diwali_sale_kurtis.mp4',
    },
    {
      id: 'video-03',
      title: 'Coimbatore Looms: Behind The Weave',
      views: '19.3K',
      duration: '1:02',
      poster: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      videoUrl: './uploads/diwali_sale_kurtis.mp4',
    },
    {
      id: 'video-04',
      title: 'Festive 2-Piece Sets & Tunic Coordinates',
      views: '35.1K',
      duration: '0:42',
      poster: 'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
      videoUrl: './uploads/diwali_sale_kurtis.mp4',
    },
  ];

  // Highlights with multi-slide story view support
  const defaultHighlights = [
    {
      id: `${storeId}-hl-1`,
      title: 'Sarees',
      icon: '🥻',
      img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      stories: [
        {
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
          caption: 'Pure Cotton Handloom Sarees fresh off the Coimbatore looms! 🪔 Breathable weave with authentic temple borders.',
          timestamp: '2h ago',
        },
        {
          image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80',
          caption: 'Intricate zari pallu detailing 🧵 100% natural organic dyed cotton.',
          timestamp: '4h ago',
        },
        {
          image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80',
          caption: 'Daily office wear & pooja drapes starting at ₹1,299! Tap Book to reserve video slot.',
          timestamp: '6h ago',
        },
      ],
    },
    {
      id: `${storeId}-hl-2`,
      title: 'Kurtis',
      icon: '✨',
      img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      stories: [
        {
          image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
          caption: 'Diwali Special Kurtis Sale! Starting at ₹1,200. Rich jewel tones & breathable comfort.',
          timestamp: '1d ago',
        },
        {
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
          caption: 'Split neckline & embroidered yoke details. All sizes S to XXL in stock!',
          timestamp: '1d ago',
        },
      ],
    },
    {
      id: `${storeId}-hl-3`,
      title: '2 Piece',
      icon: '🛍️',
      img: 'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
      stories: [
        {
          image: 'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=900&q=80',
          caption: 'Pastel 2-Piece Kurti & Trouser Sets! Modern straight cuts with pocket convenience.',
          timestamp: '2d ago',
        },
        {
          image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80',
          caption: 'Festive Chanderi 2-Piece Tunic Sets now in store with Next Day Delivery.',
          timestamp: '2d ago',
        },
      ],
    },
    {
      id: `${storeId}-hl-4`,
      title: 'Looms',
      icon: '🧵',
      img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      stories: [
        {
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
          caption: 'Behind the weave: Master weavers in Coimbatore crafting signature handloom textures.',
          timestamp: '3d ago',
        },
      ],
    },
    {
      id: `${storeId}-hl-5`,
      title: 'Reviews',
      icon: '⭐',
      img: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
      stories: [
        {
          image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80',
          caption: 'Customer appreciation: "The cotton saree drape is so lightweight and arrived next day! ⭐⭐⭐⭐⭐"',
          timestamp: '4d ago',
        },
      ],
    },
  ];

  // Retrieve any seller customizations saved to localStorage
  const savedData = getStoreCustomData(storeId);

  const finalName = savedData?.name || store?.name || 'Kalyani Cotton';
  const finalCity = savedData?.city || store?.city || 'Coimbatore';
  const finalDesc = savedData?.description || store?.description || 'Pure cotton sarees, breathable handloom weaves, and everyday traditional collections curated directly from weavers.';
  const finalAvatar = savedData?.avatar || store?.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
  const finalAddress = savedData?.address || 'Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu';
  const finalCategory = savedData?.category || store?.category || 'Sarees';

  // Merge highlights: user-added highlights come first, followed by default highlights
  const finalHighlights = Array.isArray(savedData?.highlights) && savedData.highlights.length > 0
    ? [...savedData.highlights, ...defaultHighlights.filter((dh) => !savedData.highlights.some((sh) => sh.id === dh.id || sh.title === dh.title))]
    : defaultHighlights;

  // Merge products: user-added products come first, followed by default products
  const finalProducts = Array.isArray(savedData?.products) && savedData.products.length > 0
    ? [...savedData.products, ...products.filter((dp) => !savedData.products.some((sp) => sp.id === dp.id))]
    : products;

  // Merge posts: user-added posters/posts come first, followed by default posts
  const finalPosts = Array.isArray(savedData?.posts) && savedData.posts.length > 0
    ? [...savedData.posts, ...posts.filter((dp) => !savedData.posts.some((sp) => sp.id === dp.id))]
    : posts;

  return {
    handle,
    name: finalName,
    city: finalCity,
    category: finalCategory,
    categoryLabel: `${finalCategory} • ${finalCity}`,
    description: finalDesc,
    avatar: finalAvatar,
    stats: {
      posts: '1,192',
      followers: '204K',
      products: `${finalProducts.length}`,
    },
    instagramUrl: store?.instagram_url || `https://www.instagram.com/${handle}/`,
    phone: store?.phone || '+919876543210',
    whatsappNumber: store?.whatsappNumber || store?.phone || '+919876543210',
    address: finalAddress,
    highlights: finalHighlights,
    products: finalProducts,
    posts: finalPosts,
    videos,
  };
}

export function getStoreCustomData(storeId) {
  try {
    const raw = localStorage.getItem(`mymigo_store_custom_${storeId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveStoreCustomData(storeId, data) {
  try {
    const existing = getStoreCustomData(storeId) || {};
    const updated = { ...existing, ...data };
    localStorage.setItem(`mymigo_store_custom_${storeId}`, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return null;
  }
}

export function updateStoreProfile(storeId, profileUpdates) {
  return saveStoreCustomData(storeId, profileUpdates);
}

export function addHighlightToStore(storeId, highlight) {
  const existing = getStoreCustomData(storeId) || {};
  const currentHighlights = Array.isArray(existing.highlights) ? existing.highlights : [];
  const updatedHighlights = [highlight, ...currentHighlights];
  return saveStoreCustomData(storeId, { highlights: updatedHighlights });
}

export function addProductToStore(storeId, product) {
  const existing = getStoreCustomData(storeId) || {};
  const currentProducts = Array.isArray(existing.products) ? existing.products : [];
  const updatedProducts = [product, ...currentProducts];
  return saveStoreCustomData(storeId, { products: updatedProducts });
}

export function addPostToStore(storeId, post) {
  const existing = getStoreCustomData(storeId) || {};
  const currentPosts = Array.isArray(existing.posts) ? existing.posts : [];
  const updatedPosts = [post, ...currentPosts];
  return saveStoreCustomData(storeId, { posts: updatedPosts });
}
