# **App Name**: GI Detect AI

## Core Features:

- Secure User Authentication: Enable secure sign-up and login for medical professionals using Firebase Authentication.
- GI Endoscopic Image Uploader: Provide a drag-and-drop interface and upload button for medical users to submit GI endoscopic images, with an immediate visual preview.
- AI Diagnostic Tool Integration: Send uploaded images to the Flask API endpoint (http://localhost:5000/predict) to retrieve diagnostic predictions and confidence scores from the integrated deep learning models (VGG16, ResNet50, InceptionV3).
- Dynamic Prediction Results Display: Show AI prediction results (e.g., 'Polyp', 'Ulcer'), confidence scores, and a status message (e.g., 'Detected') in clean, modern medical cards, along with a 'Model Voting Section' that details individual model outputs and the majority voting result.
- Historical Reports Page: Allow users to access a 'Reports' section to view a timeline of their previous image submissions, corresponding predictions, confidence levels, and dates.
- Prediction Data Persistence: Store all uploaded images, comprehensive AI prediction results (including individual model outputs), confidence scores, and timestamps in Firestore for easy retrieval and historical tracking.
- Professional Dashboard Navigation: Implement a clear and intuitive navigation system with a persistent sidebar (Dashboard, Upload Image, AI Results, Reports, Settings) and a top header containing the application title, a search bar, and user profile/notifications icons.

## Style Guidelines:

- The visual scheme is a dark, professional medical theme, designed to evoke precision and reliability. The primary color, chosen for its vibrancy against dark backgrounds and association with modern medical technology, is a bright cyan-teal (#52BDE0). This hue promotes a sense of clarity and digital efficiency.
- The background color is a heavily desaturated dark navy-teal (#0A2129), subtly inheriting the hue of the primary color. Its deep tone ensures comfortable viewing during extended use and emphasizes other UI elements.
- An accent color of soft medical green (#38A375) provides gentle contrast and aligns with traditional medical aesthetics. It is used for highlighting important statuses, interactive elements, and areas requiring user attention, offering a soothing and encouraging visual cue.
- The main typeface for all text elements, including headlines and body text, is 'Inter' (sans-serif). Its modern, objective, and highly readable design supports the data-intensive and professional nature of the medical dashboard, ensuring clarity and an advanced aesthetic.
- Utilize minimalist line icons throughout the interface, favoring geometric precision and subtle gradients. Icons will reflect medical themes and system functions without adding visual clutter, ensuring clear understanding within the dark, glassmorphism-inspired design.
- A multi-panel dashboard layout, featuring a structured left sidebar for primary navigation and a persistent top header for key actions and information. The central area dynamically presents a human body graphic and image processing components, with data panels styled with modern glassmorphism effects for enhanced depth and focus.
- Incorporate subtle and smooth transitions for data loading, prediction updates, and navigation changes. These animations will enhance user interaction and contribute to a polished, professional feel without distracting from critical medical information.