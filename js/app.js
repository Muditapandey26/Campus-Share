// Initialize default data if localStorage is empty to show a populated UI instantly
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('donations')) {
        const defaultDonations = [
            { id: 1, name: "Thomas' Calculus (14th Edition)", category: "Books", condition: "Like New", owner: "Alex R.", contact: "alex@campus.edu", description: "Hardcover, no markings inside." },
            { id: 2, name: "Organic Chemistry Lab Glassware Kit", category: "Lab Kits", condition: "Good", owner: "Sarah M.", contact: "sarah@campus.edu", description: "Missing one beaker, otherwise complete." },
            { id: 3, name: "Data Structures & Algorithms Notes", category: "Notes", condition: "Digital", owner: "David K.", contact: "david@campus.edu", description: "Comprehensive PDF tracking CS201 course." },
            { id: 4, name: "TI-84 Plus CE Graphing Calculator", category: "Electronics", condition: "Fair", owner: "Emma W.", contact: "emma@campus.edu", description: "Scratched body but screen works perfectly." }
        ];
        localStorage.setItem('donations', JSON.stringify(defaultDonations));
    }
    
    if (!localStorage.getItem('requests')) {
        const defaultRequests = [
            { id: 1, name: "Introduction to Algorithms (CLRS Book)", category: "Books", semester: "3rd", reason: "Required core textbook for this semester." }
        ];
        localStorage.setItem('requests', JSON.stringify(defaultRequests));
    }

    // Dynamic routing execution based on current page body tag ID
    const pageId = document.body.id;
    if (pageId === 'browse-page') initBrowsePage();
    if (pageId === 'donate-page') initDonatePage();
    if (pageId === 'request-page') initRequestPage();
    if (pageId === 'dashboard-page') initDashboardPage();
});

// Helper: Fetch array from Storage
const getStorageData = (key) => JSON.parse(localStorage.getItem(key)) || [];

// 1. DONATE LOGIC
function initDonatePage() {
    const form = document.getElementById('donationForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const donations = getStorageData('donations');
        
        const newItem = {
            id: Date.now(),
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            condition: document.getElementById('itemCondition').value,
            owner: document.getElementById('ownerName').value || "Anonymous Student",
            contact: document.getElementById('contactInfo').value,
            description: document.getElementById('itemDescription').value
        };

        donations.unshift(newItem); // Put newest items on top
        localStorage.setItem('donations', JSON.stringify(donations));
        
        alert('Resource successfully added to the campus pool!');
        window.location.href = 'browse.html';
    });
}

// 2. BROWSE LOGIC
function initBrowsePage() {
    renderCards();
    
    // Wire up filter and search fields
    document.getElementById('searchInput').addEventListener('input', renderCards);
    document.getElementById('categoryFilter').addEventListener('change', renderCards);
}

function renderCards() {
    const donations = getStorageData('donations');
    const container = document.getElementById('cardsGrid');
    if (!container) return;

    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;

    const filtered = donations.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery) || item.description.toLowerCase().includes(searchQuery);
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-12 text-center my-5 text-muted"><p>No items found matching criteria.</p></div>`;
        return;
    }

    container.innerHTML = filtered.map(item => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 custom-card p-4 d-flex flex-column justify-content-between">
                <div>
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <span class="badge badge-custom">${item.category}</span>
                        <span class="text-accent small"><i class="fas fa-sparkles"></i> ${item.condition}</span>
                    </div>
                    <h4 class="h5 mb-2">${item.name}</h4>
                    <p class="text-muted-custom small mb-4">${item.description}</p>
                </div>
                <div class="border-top border-secondary pt-3 mt-auto">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="small text-muted-custom">By: <strong>${item.owner}</strong></span>
                        <a href="mailto:${item.contact}?subject=CampusShare: Interest in ${encodeURIComponent(item.name)}" class="btn btn-primary-custom btn-sm">Claim Item</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 3. REQUEST LOGIC (With Live Match Recommendations)
function initRequestPage() {
    const form = document.getElementById('requestForm');
    const reqInput = document.getElementById('requestName');
    
    if (reqInput) {
        reqInput.addEventListener('input', (e) => {
            const query = e.target.value;
            const matchesContainer = document.getElementById('liveMatches');
            if (!matchesContainer) return;

            if (query.length < 3) {
                matchesContainer.innerHTML = '<p class="text-muted small">Type 3 or more characters to trigger our recommendation loop...</p>';
                return;
            }

            const donations = getStorageData('donations');
            const matched = donations.filter(d => d.name.toLowerCase().includes(query.toLowerCase()));

            if (matched.length === 0) {
                matchesContainer.innerHTML = '<p class="text-warning small"><i class="fas fa-exclamation-triangle"></i> No exact matches currently available in stock. Submit your request below!</p>';
            } else {
                matchesContainer.innerHTML = `
                    <p class="text-success small mb-2"><i class="fas fa-check-circle"></i> We found matching inventory items directly available to claim right now!</p>
                    <div class="list-group">
                        ${matched.map(m => `
                            <a href="browse.html" class="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                                <span><strong>${m.name}</strong> (${m.condition})</span>
                                <span class="badge bg-primary rounded-pill">View →</span>
                            </a>
                        `).join('')}
                    </div>`;
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const requests = getStorageData('requests');

            const newRequest = {
                id: Date.now(),
                name: document.getElementById('requestName').value,
                category: document.getElementById('requestCategory').value,
                semester: document.getElementById('requestSemester').value,
                reason: document.getElementById('requestReason').value
            };

            requests.unshift(newRequest);
            localStorage.setItem('requests', JSON.stringify(requests));

            alert('Your request has been broadcasted to the system feed!');
            form.reset();
            document.getElementById('liveMatches').innerHTML = '';
        });
    }
}

// 4. DASHBOARD COUNTERS LOGIC
function initDashboardPage() {
    const donationsCount = getStorageData('donations').length;
    const requestsCount = getStorageData('requests').length;

    // Hardcoded historical baseline values blended with user-generated counts
    const baseBooks = 142;
    const baseDonations = 87;
    const baseStudents = 210;
    const baseSavings = 45000;

    document.getElementById('statBooks').innerText = baseBooks + donationsCount;
    document.getElementById('statDonations').innerText = baseDonations + donationsCount;
    document.getElementById('statStudents').innerText = baseStudents + (donationsCount * 2) + requestsCount;
    document.getElementById('statSavings').innerText = '₹' + (baseSavings + (donationsCount * 850)).toLocaleString('en-IN');
}