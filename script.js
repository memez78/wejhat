// Initialize Lucide icons
lucide.createIcons();

// Application state
let currentUser = null;
let travelData = null;
let currentStep = 1;
const totalSteps = 6;

// DOM Elements
const welcomePage = document.getElementById('welcomePage');
const authContainer = document.getElementById('authContainer');
const mainContainer = document.getElementById('mainContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormEl = document.getElementById('loginFormEl');
const signupFormEl = document.getElementById('signupFormEl');
const userGreeting = document.getElementById('userGreeting');
const progressFill = document.getElementById('progressFill');
const tripsCount = document.getElementById('tripsCount');
const countriesCount = document.getElementById('countriesCount');
const daysCount = document.getElementById('daysCount');
const stepsContainer = document.getElementById('stepsContainer');
const loadingOverlay = document.getElementById('loadingOverlay');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Load travel data
    loadTravelData();

    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainContainer();
        updateUserInfo(currentUser);
    }

    setupEventListeners();
    updateProgressBar();
}

// Setup Event Listeners
function setupEventListeners() {
    // Welcome page
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn && welcomePage && authContainer) {
        getStartedBtn.addEventListener('click', () => {
            welcomePage.style.display = 'none';
            authContainer.style.display = 'flex';
        });
    }

    // Auth forms
    if (loginFormEl) loginFormEl.addEventListener('submit', handleLogin);
    if (signupFormEl) signupFormEl.addEventListener('submit', handleSignup);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.dataset.page);
        });
    });

    // Trip creation actions
    const createTripButton = document.getElementById('createTripButton');
    const createTripAction = document.getElementById('createTripAction');
    const viewTripsAction = document.getElementById('viewTripsAction');
    const emptyStateCreateTrip = document.getElementById('emptyStateCreateTrip');

    if (createTripButton) {
        createTripButton.addEventListener('click', () => {
            navigateTo('tripForm');
        });
    }

    if (createTripAction) {
        createTripAction.addEventListener('click', () => {
            navigateTo('tripForm');
        });
    }

    if (viewTripsAction) {
        viewTripsAction.addEventListener('click', () => {
            navigateTo('trips');
        });
    }

    if (emptyStateCreateTrip) {
        emptyStateCreateTrip.addEventListener('click', () => {
            navigateTo('tripForm');
        });
    }

    // Back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', () => {
            const returnPage = button.dataset.return;
            navigateTo(returnPage);
        });
    });

    // Profile buttons
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            showToast('info', 'Edit Profile', 'Profile editing feature is coming soon!');
        });
    }

    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
            showToast('info', 'Notifications', 'Notification settings coming soon!');
        });
    }

    const privacyBtn = document.getElementById('privacyBtn');
    if (privacyBtn) {
        privacyBtn.addEventListener('click', () => {
            showToast('info', 'Privacy Settings', 'Privacy settings coming soon!');
        });
    }

    // Handle accordion sections in profile
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.addEventListener('click', () => {
            // Toggle active state
            const wasActive = item.classList.contains('active');
            
            // Close all accordion items
            document.querySelectorAll('.accordion-item').forEach(other => {
                other.classList.remove('active');
            });
            
            // Toggle this item if it wasn't already active
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });

    const accountBtn = document.getElementById('accountBtn');
    if (accountBtn) {
        accountBtn.addEventListener('click', () => {
            showToast('info', 'Account Settings', 'Account settings feature will be available in the next update.');
        });
    }

    const preferencesBtn = document.getElementById('preferencesBtn');
    if (preferencesBtn) {
        preferencesBtn.addEventListener('click', () => {
            showToast('info', 'Preferences', 'Preferences feature will be available in the next update.');
        });
    }

    const paymentsBtn = document.getElementById('paymentsBtn');
    if (paymentsBtn) {
        paymentsBtn.addEventListener('click', () => {
            showToast('info', 'Payment Methods', 'Payment methods feature will be available in the next update.');
        });
    }

    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            showToast('info', 'About Wejhatii', 'Wejhatii is a surprise travel destination app that helps you discover new places.');
        });
    }

    const feedbackBtn = document.getElementById('feedbackBtn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
            showToast('info', 'Send Feedback', 'Feedback feature will be available in the next update.');
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Multi-step form navigation
    if (prevBtn) prevBtn.addEventListener('click', goToPreviousStep);
    if (nextBtn) nextBtn.addEventListener('click', goToNextStep);
    if (submitBtn) submitBtn.addEventListener('click', handleTripSubmit);

    // Date inputs
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', updateDurationDisplay);
        endDateInput.addEventListener('change', updateDurationDisplay);

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        startDateInput.min = today;
        endDateInput.min = today;
    }

    // Budget slider
    const budgetSlider = document.getElementById('budgetSlider');
    if (budgetSlider) {
        // Set initial value
        updateBudgetDisplay(budgetSlider.value);

        // Update when slider is moved
        budgetSlider.addEventListener('input', (e) => {
            updateBudgetDisplay(e.target.value);
        });
    }

    // Initialize all option cards on page load
    function initializeOptionCards() {
        console.log("Initializing option cards");

        // Special handling for multi-select travel types
        const travelTypeOptions = document.getElementById('travelTypeOptions');
        if (travelTypeOptions) {
            console.log("Found travel type options container");

            // Ensure the multi-select class is present
            if (!travelTypeOptions.classList.contains('multi-select')) {
                console.log("Adding multi-select class to travel type options");
                travelTypeOptions.classList.add('multi-select');
            }

            // Add click events to each travel style option card
            travelTypeOptions.querySelectorAll('.option-card').forEach(card => {
                // Remove any existing click listeners to avoid duplicates
                const newCard = card.cloneNode(true);
                card.parentNode.replaceChild(newCard, card);

                newCard.addEventListener('click', function() {
                    console.log("Travel style clicked:", this.getAttribute('data-value'));
                    this.classList.toggle('selected');
                    console.log("Is now selected:", this.classList.contains('selected'));

                    // Update the list of selected travel styles
                    const selectedStyles = Array.from(travelTypeOptions.querySelectorAll('.option-card.selected'))
                        .map(selectedCard => selectedCard.getAttribute('data-value'));
                    console.log("Selected travel styles:", selectedStyles);
                });
            });
        }

        // Add click events to all other option cards (single-select)
        document.querySelectorAll('.options-grid:not(.multi-select) .option-card').forEach(card => {
            // Remove any existing click listeners to avoid duplicates
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);

            newCard.addEventListener('click', function() {
                console.log("Option clicked (single-select):", this.getAttribute('data-value'));

                // Remove selection from siblings
                const siblings = this.parentElement.querySelectorAll('.option-card');
                siblings.forEach(sibling => {
                    sibling.classList.remove('selected');
                });

                // Select this card
                this.classList.add('selected');
                console.log("Selected option:", this.getAttribute('data-value'));
            });
        });
    }

    // Call initialization function after DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOptionCards);
    } else {
        initializeOptionCards();
    }

    // Also reinitialize cards when navigating to the trip form
    document.querySelectorAll('[data-return="tripForm"], #createTripButton, #emptyStateCreateTrip').forEach(button => {
        button.addEventListener('click', function() {
            setTimeout(initializeOptionCards, 100); // Give time for the DOM to update
        });
    });

    // Trip actions
    const revealButton = document.getElementById('revealButton');
    const editTripButton = document.getElementById('editTripButton');
    const deleteTripButton = document.getElementById('deleteTripButton');
    const tripResultPage = document.getElementById('tripResultPage');

    if (revealButton) {
        revealButton.addEventListener('click', revealDestination);
    }

    if (editTripButton && tripResultPage) {
        editTripButton.addEventListener('click', () => {
            const tripId = tripResultPage.dataset.tripId;
            editTrip(tripId);
        });
    }

    if (deleteTripButton && tripResultPage) {
        deleteTripButton.addEventListener('click', () => {
            const tripId = tripResultPage.dataset.tripId;
            deleteTrip(tripId);
        });
    }
}

// Navigation Functions
function showLogin() {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
}

function showSignup() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
}

function showMainContainer() {
    welcomePage.style.display = 'none';
    authContainer.style.display = 'none';
    mainContainer.style.display = 'block';
}

function navigateTo(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show the selected page
    document.getElementById(`${pageId}Page`).classList.add('active');

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageId) {
            item.classList.add('active');
        }
    });

    // Special page behaviors
    if (pageId === 'trips') {
        loadTrips();
    } else if (pageId === 'tripForm') {
        resetTripForm();
    }
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Check localStorage for user
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainContainer();
        updateUserInfo(user);
        navigateTo('home');
        showToast('success', 'Welcome back!', 'You are now logged in.');
    } else {
        showToast('error', 'Login Failed', 'Invalid email or password.');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirm').value;

    // Validate
    if (password !== confirmPassword) {
        showToast('error', 'Signup Failed', 'Passwords do not match.');
        return;
    }

    // Save user
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showToast('error', 'Signup Failed', 'Email already in use.');
        return;
    }

    const newUser = { id: generateID(), name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Log in the new user
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    showMainContainer();
    updateUserInfo(newUser);
    navigateTo('home');
    showToast('success', 'Welcome!', 'Your account has been created.');
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    welcomePage.style.display = 'flex';
    authContainer.style.display = 'none';
    mainContainer.style.display = 'none';
    showToast('info', 'Logged Out', 'You have been logged out successfully.');
}

function updateUserInfo(user) {
    if (!user) return;

    userGreeting.textContent = user.name.split(' ')[0];
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userAvatar').textContent = user.name.charAt(0);

    // Update stats
    const trips = getUserTrips();

    // Count unique countries
    const countries = new Set();
    let totalDays = 0;

    trips.forEach(trip => {
        totalDays += trip.duration;
        if (trip.destinationId) {
            countries.add(trip.destinationId);
        }
    });

    tripsCount.textContent = trips.length;
    countriesCount.textContent = countries.size;
    daysCount.textContent = totalDays;
}

// Trip Form Functions
function updateProgressBar() {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = `${progressPercentage}%`;
}

function updateDurationDisplay() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const durationDisplay = document.getElementById('durationDisplay');
    const durationError = document.getElementById('durationError');

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            durationDisplay.textContent = 'End date cannot be before start date';
            durationError.style.display = 'block';
            return false;
        }

        const differenceInTime = end.getTime() - start.getTime();
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1;

        if (differenceInDays > 365) {
            durationDisplay.textContent = `Trip duration: ${differenceInDays} days`;
            durationError.style.display = 'block';
            return false;
        }

        durationDisplay.textContent = `Trip duration: ${differenceInDays} days`;
        durationError.style.display = 'none';
        return true;
    } else {
        durationDisplay.textContent = 'Select dates to see trip duration';
        durationError.style.display = 'none';
        return false;
    }
}

// Update budget display when slider changes
function updateBudgetDisplay(value) {
    const budgetValue = document.getElementById('budgetValue');
    const budgetCategory = document.getElementById('budgetCategory');
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!budgetValue || !budgetCategory) return;

    // Calculate trip duration
    let totalDays = 1;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Estimate ticket cost based on category
    let estimatedTicketCost = 0;
    if (value <= 200) {
        estimatedTicketCost = 300;
    } else if (value <= 500) {
        estimatedTicketCost = 500;
    } else if (value <= 750) {
        estimatedTicketCost = 800;
    } else {
        estimatedTicketCost = 1200;
    }

    // Calculate total budget
    const dailyTotal = value * totalDays;
    const totalBudget = dailyTotal + estimatedTicketCost;

    // Update the displayed values
    budgetValue.textContent = `${value} BHD per day (Total: ${dailyTotal} BHD) + Tickets: ~${estimatedTicketCost} BHD\nEstimated Total: ${totalBudget} BHD`;

    // Update the category based on the value
    if (value <= 200) {
        budgetCategory.textContent = 'Budget';
    } else if (value <= 500) {
        budgetCategory.textContent = 'Moderate';
    } else if (value <= 750) {
        budgetCategory.textContent = 'Premium';
    } else {
        budgetCategory.textContent = 'Luxury';
    }
}

function goToNextStep() {
    // Validate the current step
    if (!validateStep(currentStep)) {
        return;
    }

    // Hide current step
    document.getElementById(`step${currentStep}`).classList.remove('active');

    // Increment current step
    currentStep++;

    // Show next step
    document.getElementById(`step${currentStep}`).classList.add('active');

    // Update buttons visibility
    prevBtn.style.display = 'block';

    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    }

    // Update progress bar
    updateProgressBar();
}

function goToPreviousStep() {
    // Hide current step
    document.getElementById(`step${currentStep}`).classList.remove('active');

    // Decrement current step
    currentStep--;

    // Show previous step
    document.getElementById(`step${currentStep}`).classList.add('active');

    // Update buttons visibility
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
    }

    nextBtn.style.display = 'block';
    submitBtn.style.display = 'none';

    // Update progress bar
    updateProgressBar();
}

function validateStep(step) {
    switch (step) {
        case 1:
            return updateDurationDisplay();
        case 2:
            // Check if a region is selected
            const selectedRegion = document.querySelector('#regionOptions .option-card.selected');
            if (!selectedRegion) {
                showToast('warning', 'Selection Required', 'Please select a destination region.');
                return false;
            }
            return true;
        case 3:
            // Check if at least one travel style is selected
            const selectedStyles = document.querySelectorAll('#travelTypeOptions .option-card.selected');
            console.log("Validating travel styles. Selected count:", selectedStyles.length);

            if (selectedStyles.length < 1) {
                showToast('warning', 'Selection Required', 'Please select at least one travel style.');
                return false;
            }

            // Log all selected styles for debugging
            selectedStyles.forEach(style => {
                console.log("Selected style:", style.getAttribute('data-value'));
            });

            return true;
        case 4:
            // Check if a traveler type is selected
            const selectedTravelerType = document.querySelector('#travelerTypeOptions .option-card.selected');
            if (!selectedTravelerType) {
                showToast('warning', 'Selection Required', 'Please select who is joining the trip.');
                return false;
            }
            return true;
        case 5:
            // Budget step - no validation needed, slider is always set
            return true;
        case 6:
            // Check if a dining preference is selected
            const selectedDining = document.querySelector('#diningOptions .option-card.selected');
            if (!selectedDining) {
                showToast('warning', 'Selection Required', 'Please select a dining preference.');
                return false;
            }
            return true;
        default:
            return true;
    }
}

function resetTripForm() {
    // Reset step counter
    currentStep = 1;
    updateProgressBar();

    // Reset date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('durationDisplay').textContent = 'Select dates to see trip duration';
    document.getElementById('durationError').style.display = 'none';

    // Reset all selections
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Show only first step
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('step1').classList.add('active');

    // Reset buttons
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'block';
    submitBtn.style.display = 'none';

    // Reset title
    document.getElementById('tripFormTitle').textContent = 'Create Your Trip';
}

function handleTripSubmit() {
    // Gather all form data
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const region = document.querySelector('#regionOptions .option-card.selected')?.dataset.value;

    // Collect selected travel styles
    const travelStyles = [];
    const selectedStyleCards = document.querySelectorAll('#travelTypeOptions .option-card.selected');
    console.log("Collecting travel styles. Found selected:", selectedStyleCards.length);

    selectedStyleCards.forEach(card => {
        const styleValue = card.getAttribute('data-value');
        console.log("Adding style to trip:", styleValue);
        travelStyles.push(styleValue);
    });

    console.log("Final travel styles array:", travelStyles);

    const travelerType = document.querySelector('#travelerTypeOptions .option-card.selected')?.dataset.value;
    const diningPreference = document.querySelector('#diningOptions .option-card.selected')?.dataset.value;

    const limitations = [];
    document.querySelectorAll('input[name="limitations"]:checked').forEach(checkbox => {
        limitations.push(checkbox.value);
    });

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const differenceInTime = end.getTime() - start.getTime();
    const duration = Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1;

    // Find a destination match
    const destination = findBestMatch(region, travelStyles, travelerType, diningPreference, limitations);

    // Create trip object
    const tripId = document.getElementById('tripFormPage').dataset.tripId;
    const isEditing = !!tripId;

    const trip = {
        id: isEditing ? tripId : generateID(),
        userId: currentUser.id,
        startDate,
        endDate,
        duration,
        region,
        travelStyles,
        travelerType,
        diningPreference,
        limitations,
        destinationId: destination.name,
        revealDate: calculateRevealDate(startDate),
        revealed: false,
        createdAt: isEditing ? getTrip(tripId).createdAt : new Date().toISOString()
    };

    // Save the trip
    if (isEditing) {
        updateTrip(trip);
    } else {
        createTrip(trip);
    }

    // Navigate to trip details page
    viewTrip(trip.id);
}

function findBestMatch(region, travelStyles, travelerType, diningPreference, limitations) {
    console.log("Finding best match with parameters:", {
        region,
        travelStyles,
        travelerType,
        diningPreference,
        limitations
    });

    // Check if we have valid inputs
    if (!region || !travelStyles || !Array.isArray(travelStyles) || travelStyles.length === 0) {
        console.log("Missing required preferences:", { region, travelStyles });
        return getRandomDestination();
    }

    // Ensure region is correctly formatted for lookup
    const regionKey = region.toLowerCase().trim();

    // Make sure travelData is loaded
    if (!travelData) {
        console.error("Travel data not loaded!");
        return getRandomDestination();
    }

    console.log("Available regions in travelData:", Object.keys(travelData));

    // Filter destinations by region
    const regionDestinations = travelData[regionKey];

    if (!regionDestinations || regionDestinations.length === 0) {
        console.log("No destinations found for region:", region);
        console.log("Looking for similar region name...");

        // Try to find a similar region name
        const regions = Object.keys(travelData);
        for (const r of regions) {
            if (r.includes(regionKey) || regionKey.includes(r)) {
                console.log(`Found similar region: ${r}`);
                regionDestinations = travelData[r];
                break;
            }
        }

        // If still no destinations found, return random destination
        if (!regionDestinations || regionDestinations.length === 0) {
            console.log("Still no destinations found, selecting random destination");
            return getRandomDestination();
        }
    }

    console.log(`Found ${regionDestinations.length} destinations in region ${region}`);

    // Log all available destinations in this region for debugging
    regionDestinations.forEach((dest, index) => {
        console.log(`Destination ${index+1}: ${dest.name}`);
    });

    // Create a scoring system for destinations
    const scoredDestinations = regionDestinations.map(destination => {
        let score = 0;

        // Add points based on selected travel styles
        // Enhanced scoring system that properly handles multiple travel styles

        // Define keywords for each travel style for better matching
        const styleKeywords = {
            'Cultural': ['culture', 'historic', 'heritage', 'museum', 'tradition', 'art'],
            'Adventure': ['adventure', 'outdoor', 'hiking', 'trek', 'extreme', 'exploration'],
            'Relaxation': ['relax', 'peaceful', 'beach', 'resort', 'retreat', 'spa'],
            'Urban': ['city', 'urban', 'modern', 'metropolitan', 'downtown', 'nightlife'],
            'Nature': ['nature', 'landscape', 'mountain', 'wildlife', 'natural', 'park'],
            'Food': ['cuisine', 'culinary', 'food', 'gastronomy', 'restaurant', 'taste']
        };

        const descriptionLower = destination.description.toLowerCase();

        // Calculate the total number of travel style matches
        let styleMatches = 0;

        travelStyles.forEach(style => {
            // Check if style exists in our mapping
            if (styleKeywords[style]) {
                // Check for keyword matches in the description
                const keywords = styleKeywords[style];
                const matchesForThisStyle = keywords.filter(keyword => 
                    descriptionLower.includes(keyword)
                ).length;

                if (matchesForThisStyle > 0) {
                    styleMatches++;
                    // Score is higher if more keywords match
                    score += Math.min(matchesForThisStyle * 2, 5);
                    console.log(`Style '${style}' matched for destination '${destination.name}' with ${matchesForThisStyle} keywords`);
                }
            }
        });

        // Bonus points for matching multiple styles the traveler wants
        if (styleMatches > 1) {
            const multiStyleBonus = styleMatches * 2;
            score += multiStyleBonus;
            console.log(`Destination '${destination.name}' matches ${styleMatches} travel styles, adding bonus ${multiStyleBonus} points`);
        }

        // Add additional scoring based on traveler type
        if (travelerType === 'Solo' && descriptionLower.includes('solo')) {
            score += 3;
        } else if (travelerType === 'Couple' && (descriptionLower.includes('romantic') || descriptionLower.includes('couple'))) {
            score += 3;
        } else if (travelerType === 'Family' && descriptionLower.includes('family')) {
            score += 3;
        } else if (travelerType === 'Group' && descriptionLower.includes('group')) {
            score += 3;
        }

        // Add points for dining preferences
        if (diningPreference === 'Fine Dining' && descriptionLower.includes('fine dining')) {
            score += 2;
        } else if (diningPreference === 'Local Cuisine' && descriptionLower.includes('local cuisine')) {
            score += 2;
        } else if (diningPreference === 'Street Food' && descriptionLower.includes('street food')) {
            score += 2;
        }

        // Apply limitations as penalties
        if (limitations && limitations.includes('Accessibility') && !descriptionLower.includes('accessible')) {
            score -= 10; // Significant penalty for accessibility requirements
        }

        console.log(`Destination '${destination.name}' final score: ${score}`);

        return { destination, score };
    });

    // Sort by score (highest first)
    scoredDestinations.sort((a, b) => b.score - a.score);

    // Take a random destination from the top 3 (or all if less than 3)
    const topCount = Math.min(3, scoredDestinations.length);
    const topDestinations = scoredDestinations.slice(0, topCount);
    const selectedDestination = topDestinations[Math.floor(Math.random() * topCount)];

    console.log("Selected destination:", selectedDestination.destination.name, "with score:", selectedDestination.score);
    return selectedDestination.destination;
}

function calculateRevealDate(startDate) {
    // Reveal 3 days before departure
    const start = new Date(startDate);
    const revealDate = new Date(start);
    revealDate.setDate(start.getDate() - 3);

    // If reveal date is in the past, use tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (revealDate < new Date()) {
        return tomorrow.toISOString();
    }

    return revealDate.toISOString();
}

// Trip Management Functions
function loadTrips() {
    const trips = getUserTrips();
    const tripsEmptyState = document.getElementById('tripsEmptyState');
    const tripsList = document.getElementById('tripsList');

    if (trips.length === 0) {
        tripsEmptyState.style.display = 'flex';
        tripsList.style.display = 'none';
        return;
    }

    tripsEmptyState.style.display = 'none';
    tripsList.style.display = 'block';

    // Sort trips by start date (most recent first)
    trips.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    // Clear existing trips
    tripsList.innerHTML = '';

    // Generate trip cards
    trips.forEach(trip => {
        const tripCard = createTripCard(trip);
        tripsList.appendChild(tripCard);
    });
}

function createTripCard(trip) {
    const tripCard = document.createElement('div');
    tripCard.className = 'trip-card';

    // Determine image and title based on whether destination is revealed
    let imageSrc, title, description;

    if (trip.revealed || new Date(trip.revealDate) < new Date()) {
        // Get destination info
        const destination = getDestinationById(trip.destinationId);

        imageSrc = destination?.image || 'https://images.unsplash.com/photo-1557548274-a82bc3a1bbaf';
        title = destination?.name || 'Mystery Destination';
        description = destination?.description?.substring(0, 100) + '...' || 'Your exciting journey awaits!';
    } else {
        imageSrc = 'https://images.unsplash.com/photo-1557548274-a82bc3a1bbaf';
        title = 'Mystery Destination';
        description = 'Your destination will be revealed soon! Get ready for an exciting surprise.';
    }

    tripCard.innerHTML = `
        <img src="${imageSrc}" alt="${title}" class="trip-image">
        <div class="trip-info">
            <div class="trip-date">${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</div>
            <h3 class="trip-title">${title}</h3>
            <p class="trip-description">${description}</p>
            <div class="trip-meta">
                <div class="trip-region">
                    <i data-lucide="map-pin" style="width: 1rem; height: 1rem;"></i>
                    <span>${trip.region}</span>
                </div>
                <div class="trip-actions">
                    <button class="trip-action-btn" data-action="view" data-trip-id="${trip.id}">
                        <i data-lucide="eye" class="action-icon"></i>
                    </button>
                    <button class="trip-action-btn" data-action="edit" data-trip-id="${trip.id}">
                        <i data-lucide="edit" class="action-icon"></i>
                    </button>
                    <button class="trip-action-btn" data-action="delete" data-trip-id="${trip.id}">
                        <i data-lucide="trash-2" class="action-icon"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Reinitialize Lucide icons
    lucide.createIcons({
        attrs: {
            class: 'action-icon'
        },
        root: tripCard
    });

    // Add event listeners
    tripCard.querySelector('[data-action="view"]').addEventListener('click', () => {
        viewTrip(trip.id);
    });

    tripCard.querySelector('[data-action="edit"]').addEventListener('click', () => {
        editTrip(trip.id);
    });

    tripCard.querySelector('[data-action="delete"]').addEventListener('click', () => {
        deleteTrip(trip.id);
    });

    return tripCard;
}

function viewTrip(tripId) {
    console.log('Viewing trip with ID:', tripId);

    // Show loading state
    showLoading(true);

    // Get the trip
    const trip = getTrip(tripId);
    if (!trip) {
        showToast('error', 'Error', 'Trip not found.');
        showLoading(false);
        return;
    }

    console.log('Found trip:', trip);

    // Make sure travel data is loaded
    if (!travelData) {
        console.log('Travel data not loaded, loading now...');
        loadTravelData().then(() => {
            viewTrip(tripId); // Retry after loading
        });
        return;
    }

    // Get the destination info
    const destination = getDestinationById(trip.destinationId);
    console.log('Found destination:', destination);

    if (!destination) {
        showToast('error', 'Error', 'Could not find destination information. Using default destination.');
        // Continue with a fallback instead of returning
    }

    // Update the trip result page
    const tripResultPage = document.getElementById('tripResultPage');
    tripResultPage.dataset.tripId = tripId;

    document.getElementById('resultTitle').textContent = 'Your Trip';
    document.getElementById('resultDates').textContent = `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`;
    document.getElementById('resultRegion').textContent = trip.region;

    // Check if reveal date has passed or trip is already revealed
    const shouldReveal = trip.revealed || new Date(trip.revealDate) < new Date();
    const revealSection = document.getElementById('revealSection');
    const destinationInfo = document.getElementById('destinationInfo');

    console.log('Should reveal destination?', shouldReveal);

    if (shouldReveal && !trip.revealed) {
        // Update trip to mark as revealed
        console.log('Marking trip as revealed');
        trip.revealed = true;
        updateTrip(trip);
    }

    if (shouldReveal) {
        console.log('Showing destination info');
        // Show destination info
        revealSection.style.display = 'none';
        destinationInfo.style.display = 'block';

        // Update page with destination info
        const dest = destination || {
            name: 'Destination',
            image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552',
            description: 'A wonderful travel destination with lots to explore.',
            visa: 'Information not available',
            flights: 'Information not available',
            hotels: 'Information not available',
            budget: 'Information not available',
            tips: 'Information not available',
            emergency: 'Information not available',
            bestTime: 'Information not available',
            attractions: ['Local attractions']
        };

        document.getElementById('resultImage').src = dest.image;
        document.getElementById('resultTitle').textContent = dest.name;
        document.getElementById('destinationDescription').textContent = dest.description;
        document.getElementById('visaInfo').textContent = dest.visa;
        document.getElementById('flightInfo').textContent = dest.flights;
        document.getElementById('hotelInfo').textContent = dest.hotels;
        document.getElementById('budgetInfo').textContent = dest.budget;
        document.getElementById('tipsInfo').textContent = dest.tips;
        document.getElementById('emergencyInfo').textContent = dest.emergency;
        document.getElementById('bestTimeInfo').textContent = dest.bestTime;

        // Create attraction cards
        const attractionsList = document.getElementById('attractionsList');
        attractionsList.innerHTML = '';

        dest.attractions.forEach(attraction => {
            const li = document.createElement('li');
            li.className = 'attraction-item';
            li.innerHTML = `
                <div class="attraction-info">
                    <div class="attraction-name">${attraction}</div>
                </div>
            `;
            attractionsList.appendChild(li);
        });
    } else {
        console.log('Showing countdown and reveal button');
        // Show reveal section with countdown
        revealSection.style.display = 'block';
        destinationInfo.style.display = 'none';

        // Set reveal button action
        const revealButton = document.getElementById('revealButton');
        revealButton.onclick = () => revealDestination(tripId);

        // Initially disable the reveal button (will be enabled by countdown if time has passed)
        revealButton.disabled = true;
        revealButton.classList.remove('active');

        // Start countdown
        startCountdown(tripId);
    }

    // Navigate to the trip result page
    navigateTo('tripResult');

    // Hide loading state
    showLoading(false);
}

function revealDestination() {
    const tripId = document.getElementById('tripResultPage').dataset.tripId;
    const trip = getTrip(tripId);

    // Ask user if they want to reveal now or wait
    const choice = confirm("Would you like to reveal your destination now? Click OK to reveal now, or Cancel to keep it a surprise.");

    if (choice) {
        // Reveal now
        trip.revealed = true;
        updateTrip(trip);
        viewTrip(tripId);
    } else {
        // Ask for custom reveal date
        const startDate = new Date(trip.startDate);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Create input for custom reveal date
        const customDate = prompt(
            "Enter when you'd like to reveal your destination (YYYY-MM-DD).\nDate must be between tomorrow and 1 day before departure.",
            tomorrow.toISOString().split('T')[0]
        );

        if (customDate) {
            const revealDate = new Date(customDate);
            const dayBeforeDeparture = new Date(startDate);
            dayBeforeDeparture.setDate(startDate.getDate() - 1);

            if (revealDate >= tomorrow && revealDate <= dayBeforeDeparture) {
                trip.revealDate = revealDate.toISOString();
                updateTrip(trip);
                viewTrip(tripId);
            } else {
                showToast('error', 'Invalid Date', 'Please select a date between tomorrow and the day before departure.');
            }
        }
    }
}

function startCountdown(tripId) {
    // Get the trip
    const trip = getTrip(tripId);
    if (!trip) return;

    // Get the countdown element
    const countdownEl = document.getElementById('countdown');
    const revealButtonEl = document.getElementById('revealButton');

    // Calculate the time remaining until reveal
    const revealDate = new Date(trip.revealDate);

    // Check if we should schedule a notification for this trip
    scheduleRevealNotification(trip);

    // Update countdown function
    function updateCountdown() {
        const now = new Date();
        const difference = revealDate - now;

        // If reveal date has passed, enable reveal button
        if (difference <= 0) {
            countdownEl.textContent = 'Ready to reveal!';
            countdownEl.classList.add('ready-to-reveal');

            if (revealButtonEl) {
                revealButtonEl.classList.add('active');
                revealButtonEl.disabled = false;
            }
            return;
        }

        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Update the countdown display
        countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Disable reveal button if not ready
        if (revealButtonEl) {
            revealButtonEl.classList.remove('active');
            revealButtonEl.disabled = true;
        }
    }

    // Update immediately
    updateCountdown();

    // Set interval to update countdown - update every second for more dynamic feel
    const countdownInterval = setInterval(updateCountdown, 1000);

    // Clear interval when navigating away
    document.querySelectorAll('.nav-item, .back-button').forEach(el => {
        el.addEventListener('click', () => {
            clearInterval(countdownInterval);
        });
    });
}

// Schedule a notification for when the reveal date arrives
function scheduleRevealNotification(trip) {
    if (!trip) return;

    // Only schedule if browser supports notifications
    if (!('Notification' in window)) return;

    // Check if permission is already granted
    if (Notification.permission === 'granted') {
        createRevealNotificationSchedule(trip);
    } else if (Notification.permission !== 'denied') {
        // Request permission
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                createRevealNotificationSchedule(trip);
            }
        });
    }
}

function editTrip(tripId) {
    // Get the trip
    const trip = getTrip(tripId);
    if (!trip) {
        showToast('error', 'Error', 'Trip not found.');
        return;
    }

    // Set trip form to edit mode
    const tripFormPage = document.getElementById('tripFormPage');
    tripFormPage.dataset.tripId = tripId;
    document.getElementById('tripFormTitle').textContent = 'Edit Your Trip';

    // Fill form with trip data
    document.getElementById('startDate').value = trip.startDate;
    document.getElementById('endDate').value = trip.endDate;
    updateDurationDisplay();

    // Select region
    document.querySelectorAll('#regionOptions .option-card').forEach(card => {
        if (card.dataset.value === trip.region) {
            card.classList.add('selected');
        }
    });

    // Select travel styles
    document.querySelectorAll('#travelTypeOptions .option-card').forEach(card => {
        console.log(`Checking travel style: ${card.dataset.value}, Trip styles: ${JSON.stringify(trip.travelStyles)}`);
        // First clear any previous selections to avoid duplications
        card.classList.remove('selected');

        // Check if this style is included in the trip's styles
        if (trip.travelStyles && Array.isArray(trip.travelStyles) && 
            trip.travelStyles.includes(card.dataset.value)) {
            console.log(`Selecting travel style: ${card.dataset.value}`);
            card.classList.add('selected');
        }
    });

    // Make sure travelTypeOptions has the multi-select class
    const travelTypeOptions = document.getElementById('travelTypeOptions');
    if (travelTypeOptions && !travelTypeOptions.classList.contains('multi-select')) {
        travelTypeOptions.classList.add('multi-select');
    }

    // Select traveler type
    document.querySelectorAll('#travelerTypeOptions .option-card').forEach(card => {
        if (card.dataset.value === trip.travelerType) {
            card.classList.add('selected');
        }
    });

    // Select dining preference
    document.querySelectorAll('#diningOptions .option-card').forEach(card => {
        if (card.dataset.value === trip.diningPreference) {
            card.classList.add('selected');
        }
    });

    // Check limitations
    document.querySelectorAll('input[name="limitations"]').forEach(checkbox => {
        if (trip.limitations.includes(checkbox.value)) {
            checkbox.checked = true;
        }
    });

    // Navigate to trip form
    navigateTo('tripForm');
}

function deleteTrip(tripId) {
    // Get the trip
    const trip = getTrip(tripId);
    if (!trip) {
        showToast('error', 'Error', 'Trip not found.');
        return;
    }

    // Ask for confirmation
    if (confirm('Are you sure you want to delete this trip?')) {
        // Delete the trip
        const trips = JSON.parse(localStorage.getItem('trips') || '[]');
        const updatedTrips = trips.filter(t => t.id !== tripId);
        localStorage.setItem('trips', JSON.stringify(updatedTrips));

        // Navigate to trips page
        navigateTo('trips');

        // Update user info
        updateUserInfo(currentUser);

        showToast('success', 'Trip Deleted', 'Your trip has been deleted successfully.');
    }
}

// Data Management Functions
function getUserTrips() {
    if (!currentUser) return [];

    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    return trips.filter(trip => trip.userId === currentUser.id);
}

function getTrip(tripId) {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    return trips.find(trip => trip.id === tripId);
}

function createTrip(trip) {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    trips.push(trip);
    localStorage.setItem('trips', JSON.stringify(trips));
    updateUserInfo(currentUser);
    showToast('success', 'Trip Created', 'Your trip has been created successfully.');
}

function updateTrip(updatedTrip) {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const index = trips.findIndex(trip => trip.id === updatedTrip.id);

    if (index !== -1) {
        trips[index] = updatedTrip;
        localStorage.setItem('trips', JSON.stringify(trips));
        updateUserInfo(currentUser);
        showToast('success', 'Trip Updated', 'Your trip has been updated successfully.');
    }
}

function getDestinationById(id) {
    if (!travelData) {
        console.error('Travel data not loaded when trying to get destination:', id);
        return null;
    }

    // Log for debugging
    console.log('Looking for destination:', id);
    console.log('Available regions:', Object.keys(travelData));

    // Try to find the destination in all regions
    for (const region in travelData) {
        console.log(`Searching in region ${region}, destinations:`, travelData[region].length);
        const destination = travelData[region].find(dest => dest.name === id);
        if (destination) {
            console.log('Found destination:', destination.name);
            return destination;
        }
    }

    console.error('Destination not found:', id);

    // If destination is not found, return a default destination as fallback
    if (travelData.europe && travelData.europe.length > 0) {
        console.log('Returning default destination:', travelData.europe[0].name);
        return travelData.europe[0];
    }

    return null;
}

function getRandomDestination() {
    if (!travelData) return null;

    // Get all destinations from all regions
    const allDestinations = [];
    for (const region in travelData) {
        allDestinations.push(...travelData[region]);
    }

    // Return a random destination
    return allDestinations[Math.floor(Math.random() * allDestinations.length)];
}

async function loadTravelData() {
    showLoading(true);

    try {
        console.log('Loading travel data...');
        const response = await fetch('travel.json');

        if (!response.ok) {
            throw new Error(`Failed to fetch travel data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        travelData = data.destinations;

        console.log('Travel data loaded successfully');
        console.log('Available regions:', Object.keys(travelData));

        // Log count of destinations per region
        for (const region in travelData) {
            console.log(`Region ${region} has ${travelData[region].length} destinations`);
        }

        showLoading(false);
        return travelData;
    } catch (error) {
        console.error('Error loading travel data:', error);
        showToast('error', 'Data Error', 'Failed to load destination data. Please try again later.');
        showLoading(false);
        return null;
    }
}

// Utility Functions
function generateID() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showToast(type, title, message) {
    const toastContainer = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon;
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'x-circle';
            break;
        case 'warning':
            icon = 'alert-triangle';
            break;
        default:
            icon = 'info';
    }

    toast.innerHTML = `
        <i data-lucide="${icon}" class="toast-icon ${type}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i data-lucide="x" class="toast-close-icon"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    lucide.createIcons({
        root: toast
    });

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// Show a native browser notification
function showNotification(title, body, options = {}) {
    // Show a notification
    if ('Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
                body: body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: generateID(),
                    url: options.url || '/',
                    ...(options.data || {})
                },
                actions: options.actions || [
                    {
                        action: 'view',
                        title: 'View'
                    }
                ],
                tag: options.tag || 'general-notification'
            });
        });
    }
}

// Create a scheduled notification for trip reveal
function createRevealNotificationSchedule(trip) {
    if (!trip || !trip.revealDate) return;

    const destination = getDestinationById(trip.destinationId);
    if (!destination) return;

    const revealDate = new Date(trip.revealDate);
    const now = new Date();

    // Calculate time until reveal
    let timeUntilReveal = revealDate.getTime() - now.getTime();

    // If reveal date is in the past, don't schedule
    if (timeUntilReveal <= 0) return;

    // Schedule the notification using setTimeout
    setTimeout(() => {
        showNotification('Trip Reveal Ready!', 
            `Your mystery destination is ready to be revealed!`, {
            tag: `trip-reveal-${trip.id}`,
            data: {
                tripId: trip.id
            },
            actions: [
                {
                    action: 'view',
                    title: 'View Trip'
                }
            ]
        });
    }, timeUntilReveal);

    // Also schedule a 1-day reminder if we have more than 24 hours
    if (timeUntilReveal > 24 * 60 * 60 * 1000) {
        setTimeout(() => {
            showNotification('Trip Reveal Tomorrow!', 
                `Your mystery destination will be revealed tomorrow!`, {
                tag: `trip-reminder-${trip.id}`,
                data: {
                    tripId: trip.id
                }
            });
        }, timeUntilReveal - (24 * 60 * 60 * 1000));
    }
}

// Expose functions to global scope for HTML onclick handlers
window.showLogin = showLogin;
window.showSignup = showSignup;
window.showMainContainer = showMainContainer;
window.navigateTo = navigateTo;