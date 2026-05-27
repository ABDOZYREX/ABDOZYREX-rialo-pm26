const worldCupGroups = [
    { id: "A", name: "Group A", teams: [["Mexico", "mx"], ["South Africa", "za"], ["South Korea", "kr"], ["Czechia", "cz"]] },
    { id: "B", name: "Group B", teams: [["Canada", "ca"], ["Switzerland", "ch"], ["Qatar", "qa"], ["Bosnia and Herzegovina", "ba"]] },
    { id: "C", name: "Group C", teams: [["Brazil", "br"], ["Morocco", "ma"], ["Scotland", "gb-sct"], ["Haiti", "ht"]] },
    { id: "D", name: "Group D", teams: [["United States", "us"], ["Australia", "au"], ["Paraguay", "py"], ["Turkiye", "tr"]] },
    { id: "E", name: "Group E", teams: [["Germany", "de"], ["Curacao", "cw"], ["Cote d'Ivoire", "ci"], ["Ecuador", "ec"]] },
    { id: "F", name: "Group F", teams: [["Netherlands", "nl"], ["Japan", "jp"], ["Tunisia", "tn"], ["Sweden", "se"]] },
    { id: "G", name: "Group G", teams: [["Belgium", "be"], ["Iran", "ir"], ["Egypt", "eg"], ["New Zealand", "nz"]] },
    { id: "H", name: "Group H", teams: [["Spain", "es"], ["Uruguay", "uy"], ["Saudi Arabia", "sa"], ["Cape Verde", "cv"]] },
    { id: "I", name: "Group I", teams: [["France", "fr"], ["Senegal", "sn"], ["Norway", "no"], ["Iraq", "iq"]] },
    { id: "J", name: "Group J", teams: [["Argentina", "ar"], ["Austria", "at"], ["Algeria", "dz"], ["Jordan", "jo"]] },
    { id: "K", name: "Group K", teams: [["Portugal", "pt"], ["Colombia", "co"], ["Uzbekistan", "uz"], ["DR Congo", "cd"]] },
    { id: "L", name: "Group L", teams: [["England", "gb-eng"], ["Croatia", "hr"], ["Panama", "pa"], ["Ghana", "gh"]] }
];

const groupOrders = {};
const completedGroups = new Set();
const madePicks = new Set();
const groupMoveEffects = {};

let selectedEntryAmount = 0.000001;
let bracketGenerated = false;
let walletConnected = false;
let connectedWalletAddress = "";
let lastAdvancedPrefix = null;
let lastAdvancedRound = null;
let lastAdvancedMatch = null;
let nftRefreshHookReady = false;
let rialoAppInitialized = false;
let aiAssistantReady = false;
let aiAssistantBusy = false;

const teamRatings = {
    Brazil: 95,
    Argentina: 95,
    France: 94,
    Spain: 92,
    England: 91,
    Portugal: 90,
    Netherlands: 89,
    Germany: 88,
    Belgium: 87,
    Croatia: 86,
    Uruguay: 85,
    Morocco: 84,
    Colombia: 83,
    "United States": 82,
    Senegal: 81,
    Japan: 80,
    Switzerland: 79,
    Austria: 78,
    Norway: 77,
    "South Korea": 76,
    Sweden: 76,
    Australia: 75,
    Mexico: 75,
    Paraguay: 74,
    Ecuador: 74,
    Czechia: 74,
    Algeria: 73,
    "Turkiye": 73,
    "Cote d'Ivoire": 72,
    Ghana: 72,
    Iran: 71,
    Tunisia: 70,
    Egypt: 70,
    "Bosnia and Herzegovina": 70,
    Panama: 68,
    Scotland: 68,
    "Saudi Arabia": 67,
    Qatar: 66,
    "South Africa": 66,
    "DR Congo": 65,
    Uzbekistan: 65,
    Jordan: 64,
    Iraq: 64,
    Canada: 64,
    Haiti: 58,
    "Cape Verde": 58,
    "Curacao": 56,
    "New Zealand": 55
};

const RIALO_TESTNET = {
    chainId: "0x14a34",
    chainName: "Rialo Testnet",
    nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18
    },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"]
};

const RIALO_NETWORK_DISPLAY_NAME = "Rialo Testnet";
const RIALO_REAL_NATIVE_TX_VALUE = "0.001";

const RIALO_RECEIVER_ADDRESS = "";
const RIALO_MARKET_FACTORY_ARTIFACT_URL = "/rialo-market-factory.artifact.json";
const RIALO_MARKET_FACTORY_STORAGE_KEY = `rialo-market-factory-address-v3-${RIALO_TESTNET.chainId}`;
const RIALO_NFT_MARKETPLACE_ARTIFACT_URL = "/rialo-nft-marketplace.artifact.json";
const RIALO_MOCK_USDC_ARTIFACT_URL = "/rialo-mock-usdc.artifact.json";
const RIALO_MOCK_USDT_ARTIFACT_URL = "/rialo-mock-usdt.artifact.json";
const RIALO_USDC_SWAP_ARTIFACT_URL = "/rialo-usdc-swap.artifact.json";
const RIALO_MOCK_USDT_STORAGE_KEY = `rialo-mock-usdt-address-v1-${RIALO_TESTNET.chainId}`;
const RIALO_USDT_SWAP_STORAGE_KEY = `rialo-usdt-swap-address-v1-${RIALO_TESTNET.chainId}`;
const RIALO_MOCK_USDC_STORAGE_KEY = `rialo-mock-usdc-address-v3-${RIALO_TESTNET.chainId}`;
const RIALO_USDC_SWAP_STORAGE_KEY = `rialo-usdc-swap-address-v4-${RIALO_TESTNET.chainId}`;
const SWAP_DEFAULT_SEED_USDC = "0.05";
const SWAP_DEFAULT_SEED_RLO = "0.1";
const RLO_REFERENCE_USD_PRICE = 0.5;
const USDC_REFERENCE_USD_PRICE = 1;
const USDT_REFERENCE_USD_PRICE = 1;
const SWAP_TEST_STABLE_TX_AMOUNT = "0.001";
const ERC20_MINIMAL_ABI = [
    "function approve(address spender, uint256 value) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

const NFT_CONTRACT_ADDRESS = "0x106Ae2d1a54DB2aDEaD4Ba6DbC8D8Cc9716fE5CE";
const NFT_REAL_MINT_PRICE_RLO = RIALO_REAL_NATIVE_TX_VALUE;
const RIALO_NFT_MARKETPLACE_STORAGE_KEY = `rialo-nft-marketplace-address-v3-${RIALO_TESTNET.chainId}-${NFT_CONTRACT_ADDRESS.toLowerCase()}`;

const NFT_CONTRACT_ABI = [
    "function mint(uint256 tokenId, uint256 amount) payable",
    "function mintPrice(uint256 tokenId) view returns (uint256)",
    "function balanceOf(address account, uint256 id) view returns (uint256)",
    "function isApprovedForAll(address account, address operator) view returns (bool)",
    "function setApprovalForAll(address operator, bool approved)"
];

const nftListingsByCode = {};
const nftOwnedBalancesByCode = {};
const nftUiState = {
    listingCode: "",
    listingTokenId: 0
};
let nftViewMode = "collection";
let nftMarketplaceArtifactPromise = null;
let validatedNftMarketplaceAddress = "";
let swapReady = false;

const nftTokenIdsByCode = {};
let nftTokenAutoId = 1;

worldCupGroups.forEach(group => {
    group.teams.forEach(([, code]) => {
        nftTokenIdsByCode[code] = nftTokenAutoId++;
    });
});

const nftCaptainDataByCode = {
    mx: { image: "nftmx.jpg", captain: "Edson Alvarez", priceRlo: 12 },
    za: { image: "nftza.jpg", captain: "Ronwen Williams", priceRlo: 7 },
    kr: { image: "nftkr.jpg", captain: "Son Heung-min", priceRlo: 21 },
    cz: { image: "nftcz.jpg", captain: "Tomas Soucek", priceRlo: 11 },

    ca: { image: "nftca.jpg", captain: "Alphonso Davies", priceRlo: 18 },
    ch: { image: "nftch.jpg", captain: "Granit Xhaka", priceRlo: 15 },
    qa: { image: "nftqa.jpg", captain: "Hassan Al-Haydos", priceRlo: 6 },
    ba: { image: "nftba.jpg", captain: "Edin Dzeko", priceRlo: 14 },

    br: { image: "nftbr.jpg", captain: "Marquinhos", priceRlo: 19 },
    ma: { image: "nftma.jpg", captain: "Achraf Hakimi", priceRlo: 20 },
    "gb-sct": { image: "nftgb-sct.jpg", captain: "Andrew Robertson", priceRlo: 17 },
    ht: { image: "nftht.jpg", captain: "Duckens Nazon", priceRlo: 5 },

    us: { image: "nftus.jpg", captain: "Christian Pulisic", priceRlo: 16 },
    au: { image: "nftau.jpg", captain: "Mathew Ryan", priceRlo: 9 },
    py: { image: "nftpy.jpg", captain: "Miguel Almiron", priceRlo: 13 },
    tr: { image: "nfttr.jpg", captain: "Arda Guler", priceRlo: 16 },

    de: { image: "nftde.jpg", captain: "Joshua Kimmich", priceRlo: 20 },
    cw: { image: "nftcw.jpg", captain: "Cuco Martina", priceRlo: 4 },
    ci: { image: "nftci.jpg", captain: "Sebastien Haller", priceRlo: 13 },
    ec: { image: "nftec.jpg", captain: "Enner Valencia", priceRlo: 12 },

    nl: { image: "nftnl.jpg", captain: "Virgil van Dijk", priceRlo: 22 },
    jp: { image: "nftjp.jpg", captain: "Wataru Endo", priceRlo: 13 },
    tn: { image: "nfttn.jpg", captain: "Youssef Msakni", priceRlo: 8 },
    se: { image: "nftse.jpg", captain: "Victor Lindelof", priceRlo: 12 },

    be: { image: "nftbe.jpg", captain: "Kevin De Bruyne", priceRlo: 24 },
    ir: { image: "nftir.jpg", captain: "Alireza Jahanbakhsh", priceRlo: 10 },
    eg: { image: "nfteg.jpg", captain: "Mohamed Salah", priceRlo: 1 },
    nz: { image: "nftnz.jpg", captain: "Chris Wood", priceRlo: 10 },

    es: { image: "nftes.jpg", captain: "Alvaro Morata", priceRlo: 17 },
    uy: { image: "nftuy.jpg", captain: "Federico Valverde", priceRlo: 21 },
    sa: { image: "nftsa.jpg", captain: "Salem Al-Dawsari", priceRlo: 13 },
    cv: { image: "nftcv.jpg", captain: "Ryan Mendes", priceRlo: 7 },

    fr: { image: "nftfr.jpg", captain: "Kylian Mbappe", priceRlo: 25 },
    sn: { image: "nftsn.jpg", captain: "Kalidou Koulibaly", priceRlo: 16 },
    no: { image: "nftno.jpg", captain: "Martin Odegaard", priceRlo: 21 },
    iq: { image: "nftiq.jpg", captain: "Jalal Hassan", priceRlo: 5 },

    ar: { image: "nftar.jpg", captain: "Lionel Messi", priceRlo: 25 },
    at: { image: "nftat.jpg", captain: "David Alaba", priceRlo: 17 },
    dz: { image: "nftdz.jpg", captain: "Riyad Mahrez", priceRlo: 9 },
    jo: { image: "nftjo.jpg", captain: "Mousa Al-Tamari", priceRlo: 9 },

    pt: { image: "nftpt.jpg", captain: "Cristiano Ronaldo", priceRlo: 30 },
    co: { image: "nftco.jpg", captain: "James Rodriguez", priceRlo: 15 },
    uz: { image: "nftuz.jpg", captain: "Eldor Shomurodov", priceRlo: 9 },
    cd: { image: "nftcd.jpg", captain: "Chancel Mbemba", priceRlo: 12 },

    "gb-eng": { image: "nftgb-eng.jpg", captain: "Harry Kane", priceRlo: 23 },
    hr: { image: "nfthr.jpg", captain: "Luka Modric", priceRlo: 22 },
    pa: { image: "nftpa.jpg", captain: "Anibal Godoy", priceRlo: 6 },
    gh: { image: "nftgh.jpg", captain: "Thomas Partey", priceRlo: 15 }
};

let nftOriginalOrderCounter = 0;

const expandedRialoWorldCupNfts = worldCupGroups
    .flatMap(group =>
        group.teams.map(([country, code]) => {
            const nftData = nftCaptainDataByCode[code] || {};
            const card = {
                country,
                code,
                captain: nftData.captain || country,
                image: nftData.image || `nft${code}.jpg`,
                priceRlo: typeof nftData.priceRlo === "number" ? nftData.priceRlo : 0,
                sortOrder: nftOriginalOrderCounter++
            };

            return card;
        })
    )
    .sort((a, b) => {
        if (b.priceRlo !== a.priceRlo) {
            return b.priceRlo - a.priceRlo;
        }

        return a.sortOrder - b.sortOrder;
    });

function getNftCardByCode(code) {
    return expandedRialoWorldCupNfts.find(card => card.code === code) || null;
}

function getNftTokenIdByCode(code) {
    return nftTokenIdsByCode[code] || 0;
}

function getNftOwnedBalanceByCode(code) {
    return Number(nftOwnedBalancesByCode[String(code || "").toLowerCase()] || 0);
}

function getNftListingsForCode(code) {
    return nftListingsByCode[String(code || "").toLowerCase()] || [];
}

function getCurrentWalletNftListing(code) {
    if (!connectedWalletAddress) {
        return null;
    }

    const normalizedWallet = String(connectedWalletAddress || "").toLowerCase();
    return getNftListingsForCode(code).find(listing => String(listing.sellerAddress || "").toLowerCase() === normalizedWallet) || null;
}

function getCurrentWalletNftListedAmountByCode(code) {
    const currentListing = getCurrentWalletNftListing(code);
    return currentListing ? Math.max(0, Math.floor(Number(currentListing.amount || 0))) : 0;
}

function getNftCollectionListing(code) {
    return getNftListingsForCode(code)[0] || null;
}

function getTotalNftListedAmountByCode(code) {
    return getNftListingsForCode(code).reduce((total, listing) => {
        return total + Math.max(0, Math.floor(Number(listing.amount || 0)));
    }, 0);
}

function getBestBuyableNftListing(code) {
    const normalizedWallet = String(connectedWalletAddress || "").toLowerCase();
    return getNftListingsForCode(code).find(listing => {
        if (!normalizedWallet) {
            return true;
        }

        return String(listing.sellerAddress || "").toLowerCase() !== normalizedWallet;
    }) || null;
}

function buildNftListedInventory() {
    const inventory = [];

    Object.values(nftListingsByCode).forEach(entries => {
        entries.forEach(listing => {
            const card = getNftCardByCode(listing.code);
            const amount = Math.max(0, Math.floor(Number(listing.amount || 0)));

            if (!card || amount <= 0) {
                return;
            }

            for (let index = 0; index < amount; index += 1) {
                inventory.push({
                    card,
                    listing,
                    unitIndex: index + 1
                });
            }
        });
    });

    return inventory.sort((a, b) => Number(b.listing.priceRlo || 0) - Number(a.listing.priceRlo || 0));
}

function buildNftListedInventoryByCode() {
    const groupedInventory = {};

    buildNftListedInventory().forEach(entry => {
        const code = String(entry.card?.code || "").toLowerCase();
        if (!code) {
            return;
        }

        if (!groupedInventory[code]) {
            groupedInventory[code] = [];
        }

        groupedInventory[code].push(entry);
    });

    return groupedInventory;
}

function setNftListings(listings = []) {
    Object.keys(nftListingsByCode).forEach(code => {
        delete nftListingsByCode[code];
    });

    (Array.isArray(listings) ? listings : []).forEach(listing => {
        const code = String(listing.code || "").toLowerCase();
        if (!code) {
            return;
        }

        if (!nftListingsByCode[code]) {
            nftListingsByCode[code] = [];
        }

        nftListingsByCode[code].push({
            code,
            tokenId: Number(listing.tokenId || 0),
            sellerAddress: String(listing.sellerAddress || ""),
            amount: Number(listing.amount || 0),
            priceRlo: Number(listing.priceRlo || 0),
            txHash: String(listing.txHash || ""),
            createdAt: String(listing.createdAt || ""),
            updatedAt: String(listing.updatedAt || "")
        });
    });

    Object.values(nftListingsByCode).forEach(entries => {
        entries.sort((a, b) => Number(a.priceRlo || 0) - Number(b.priceRlo || 0));
    });
}

const RIALO_BACKEND_URL = "https://rialo-pmm.onrender.com";

function getApiUrl(pathname) {
    const path = String(pathname || "");
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const host = window.location.hostname || "";
    const isLocalBackend = host === "localhost" || host === "127.0.0.1" || host.includes("onrender.com");
    const useRemoteBackend = window.location.protocol === "file:" || !isLocalBackend;

    if (!useRemoteBackend) {
        return path;
    }

    return `${RIALO_BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
async function apiFetchJson(pathname, options = {}) {
    const response = await fetch(getApiUrl(pathname), {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        body: options.body
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || "Request failed.");
    }

  return data;
}

function getAiAssistantRefs() {
    return {
        shell: document.getElementById("ai-assistant-shell"),
        fab: document.getElementById("ai-assistant-fab"),
        fabIcon: document.querySelector("#ai-assistant-fab .ai-fab-icon"),
        fabLogo: document.querySelector("#ai-assistant-fab .ai-fab-logo"),
        fabCustomImage: document.getElementById("ai-fab-custom-image"),
        panel: document.getElementById("ai-assistant-panel"),
        close: document.getElementById("ai-assistant-close"),
        meta: document.getElementById("ai-assistant-meta"),
        messages: document.getElementById("ai-assistant-messages"),
        suggestions: document.getElementById("ai-assistant-suggestions"),
        form: document.getElementById("ai-assistant-form"),
        input: document.getElementById("ai-assistant-input")
    };
}

function escapeAiHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function appendAiMessage(role, text) {
    const refs = getAiAssistantRefs();
    if (!refs.messages) return;

    const article = document.createElement("article");
    article.className = `ai-message ${role === "user" ? "ai-message-user" : "ai-message-assistant"}`;
    article.innerHTML = `
        <strong>${role === "user" ? "You" : "Rialo Chat"}</strong>
        <p>${escapeAiHtml(text)}</p>
    `;
    refs.messages.appendChild(article);
    refs.messages.scrollTop = refs.messages.scrollHeight;
}

function setAiAssistantMeta(text) {
    const refs = getAiAssistantRefs();
    if (refs.meta) {
        refs.meta.textContent = text;
    }
}

function setupAiAssistantCustomIcon() {
    const refs = getAiAssistantRefs();
    const image = refs.fabCustomImage;
    if (!image) {
        return;
    }

    const showFallback = () => {
        image.classList.add("hidden");
        refs.fabLogo?.classList.remove("hidden");
        refs.fab?.classList.remove("ai-assistant-fab-image-mode");
    };

    const showCustomImage = () => {
        image.classList.remove("hidden");
        refs.fabLogo?.classList.add("hidden");
        refs.fab?.classList.add("ai-assistant-fab-image-mode");
    };

    image.addEventListener("load", showCustomImage, { once: true });
    image.addEventListener("error", showFallback, { once: true });

    if (image.complete && image.naturalWidth > 0) {
        showCustomImage();
        return;
    }

    if (image.complete && !image.naturalWidth) {
        showFallback();
    }
}

function buildAiAssistantMetaText(response) {
    if (response?.mode === "openai") {
        return "Live AI response delivered.";
    }

    const reason = String(response?.fallbackReason || "").toLowerCase();
    if (reason.includes("quota") || reason.includes("billing")) {
        return "OpenAI is connected, but the API quota or billing is exhausted. Using local assistant.";
    }

    if (reason.includes("invalid api key") || reason.includes("incorrect api key")) {
        return "OpenAI key is invalid. Using local assistant.";
    }

    if (reason.includes("rate limit")) {
        return "OpenAI rate limit reached. Using local assistant.";
    }

    return "OpenAI is unavailable right now. Using local assistant.";
}

function openAiAssistant() {
    const refs = getAiAssistantRefs();
    if (!refs.panel || !refs.fab) return;
    refs.panel.classList.remove("hidden");
    refs.fab.setAttribute("aria-expanded", "true");
    setAiAssistantMeta("Ask about trading, NFTs, wallet steps, predictions, or how this product works.");
    setTimeout(() => refs.input?.focus(), 50);
}

function closeAiAssistant() {
    const refs = getAiAssistantRefs();
    if (!refs.panel || !refs.fab) return;
    refs.panel.classList.add("hidden");
    refs.fab.setAttribute("aria-expanded", "false");
}

function getAiActivePageLabel() {
    if (document.body.classList.contains("market-mode")) return "market";
    if (document.body.classList.contains("nft-mode")) return "nft";
    const groupsView = document.getElementById("groups-view");
    const bracketView = document.getElementById("bracket-view");
    if (bracketView?.classList.contains("active")) return "bracket";
    if (groupsView?.classList.contains("active")) return "groups";
    return "home";
}

function buildAiContextPayload() {
    const activeTokenName = document.getElementById("market-detail-name")?.textContent?.trim() || "";
    const activeTokenSymbol = document.getElementById("market-detail-symbol")?.textContent?.trim() || "";
    const nftMode = typeof nftViewMode === "string" ? nftViewMode : "collection";
    const activePage = getAiActivePageLabel();
    const walletStatus = walletConnected ? "connected" : "disconnected";

    return {
        activePage,
        walletStatus,
        walletAddress: connectedWalletAddress || "",
        activeTokenName,
        activeTokenSymbol,
        nftMode,
        bracketGenerated,
        madePicks: madePicks.size,
        completedGroups: completedGroups.size
    };
}

async function askAI(question) {
    const response = await fetch(`${RIALO_BACKEND_URL}/ask`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question: question
        })
    });

    const data = await response.json();

    return data.answer;
}
async function submitAiAssistantMessage(messageText) {
    const refs = getAiAssistantRefs();
    if (!refs.input || !refs.form || aiAssistantBusy) {
        return;
    }

    const text = String(messageText || refs.input.value || "").trim();
    if (!text) {
        return;
    }

    aiAssistantBusy = true;
    refs.input.value = "";
    appendAiMessage("user", text);
    setAiAssistantMeta("Thinking...");

    const typing = document.createElement("div");
    typing.className = "ai-assistant-typing";
    typing.id = "ai-assistant-typing";
    typing.textContent = "Rialo Chat is typing...";
    refs.messages?.appendChild(typing);
    refs.messages.scrollTop = refs.messages.scrollHeight;

    try {
        const answer = await askAI(text);

        typing.remove();
        appendAiMessage("assistant", answer || "I’m here. Try asking me again.");
        setAiAssistantMeta("Live Rialo Chat response delivered.");
    } catch (error) {
        typing.remove();
        appendAiMessage("assistant", error.message || "I couldn’t answer that right now.");
        setAiAssistantMeta("Assistant is available, but this reply used the local fallback.");
    } finally {
        aiAssistantBusy = false;
        refs.messages.scrollTop = refs.messages.scrollHeight;
    }
}

function setupAiAssistant() {
    const refs = getAiAssistantRefs();
    if (!refs.shell || !refs.fab || !refs.panel || !refs.form || !refs.input || aiAssistantReady) {
        return;
    }

    aiAssistantReady = true;
    setupAiAssistantCustomIcon();

    refs.fab.addEventListener("click", () => {
        if (refs.panel.classList.contains("hidden")) {
            openAiAssistant();
        } else {
            closeAiAssistant();
        }
    });

    refs.close?.addEventListener("click", closeAiAssistant);

    refs.form.addEventListener("submit", async event => {
        event.preventDefault();
        await submitAiAssistantMessage();
    });

    refs.input.addEventListener("keydown", async event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            await submitAiAssistantMessage();
        }
    });

    refs.suggestions?.querySelectorAll(".ai-suggestion-chip").forEach(button => {
        button.addEventListener("click", async () => {
            await submitAiAssistantMessage(button.textContent || "");
        });
    });
}

async function loadNftListingsFromServer() {
    const data = await apiFetchJson("/api/nft-listings");
    setNftListings(data.listings || []);
}

function getStoredNftMarketplaceAddress() {
    try {
        return localStorage.getItem(RIALO_NFT_MARKETPLACE_STORAGE_KEY) || "";
    } catch {
        return "";
    }
}

function setStoredNftMarketplaceAddress(address) {
    try {
        if (address) {
            localStorage.setItem(RIALO_NFT_MARKETPLACE_STORAGE_KEY, address);
        } else {
            localStorage.removeItem(RIALO_NFT_MARKETPLACE_STORAGE_KEY);
        }
    } catch {
        // Ignore storage failures.
    }
}

async function getNftMarketplaceArtifact() {
    if (!nftMarketplaceArtifactPromise) {
        nftMarketplaceArtifactPromise = fetch(RIALO_NFT_MARKETPLACE_ARTIFACT_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error("NFT marketplace artifact is not available.");
                }

                return response.json();
            });
    }

    return nftMarketplaceArtifactPromise;
}

async function getNftMarketplaceContract(target, forcedAddress = "") {
    if (!window.ethereum || typeof ethers === "undefined") {
        return null;
    }

    const artifact = await getNftMarketplaceArtifact();
    const marketplaceAddress = forcedAddress || getStoredNftMarketplaceAddress();

    if (!marketplaceAddress) {
        return null;
    }

    const provider = target && typeof target.getAddress === "function"
        ? target.provider
        : target;

    if (!provider || typeof provider.getCode !== "function") {
        return null;
    }

    if (marketplaceAddress !== validatedNftMarketplaceAddress) {
        const code = await provider.getCode(marketplaceAddress);
        if (!code || code === "0x") {
            setStoredNftMarketplaceAddress("");
            validatedNftMarketplaceAddress = "";
            return null;
        }

        validatedNftMarketplaceAddress = marketplaceAddress;
    }

    return new ethers.Contract(marketplaceAddress, artifact.abi, target);
}

async function ensureOnChainNftMarketplace(signer) {
    let contract = await getNftMarketplaceContract(signer);
    if (contract) {
        return contract;
    }

    const artifact = await getNftMarketplaceArtifact();
    const builder = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    contract = await builder.deploy(NFT_CONTRACT_ADDRESS);
    await contract.waitForDeployment();

    const deployedAddress = await contract.getAddress();
    setStoredNftMarketplaceAddress(deployedAddress);
    validatedNftMarketplaceAddress = deployedAddress;
    return contract;
}

async function loadNftOwnershipForWallet() {
    Object.keys(nftOwnedBalancesByCode).forEach(code => {
        delete nftOwnedBalancesByCode[code];
    });

    if (!connectedWalletAddress || !window.ethereum || typeof ethers === "undefined") {
        return;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);

        const balances = await Promise.all(expandedRialoWorldCupNfts.map(async card => {
            const tokenId = getNftTokenIdByCode(card.code);
            try {
                const balance = await contract.balanceOf(connectedWalletAddress, tokenId);
                return [card.code, Number(balance.toString())];
            } catch {
                return [card.code, 0];
            }
        }));

        balances.forEach(([code, balance]) => {
            nftOwnedBalancesByCode[String(code || "").toLowerCase()] = Number(balance || 0);
        });
    } catch {
        // Keep ownership empty on read failure to avoid breaking the NFT view.
    }
}

async function refreshNftUiState() {
    try {
        await loadNftListingsFromServer();
        await loadNftOwnershipForWallet();
        renderExpandedNftCollection();
    } catch {
        renderExpandedNftCollection();
    }
}

window.refreshRialoNftUi = refreshNftUiState;

function setMintButtonState(button, text, disabled = false) {
    if (!button) return;
    button.textContent = text;
    button.disabled = disabled;
}

function setWalletUiAfterMint(address) {
    const walletButton = document.getElementById("connect-wallet");
    const walletStatus = document.getElementById("wallet-status");
    const lockOverlay = document.getElementById("wallet-lock-overlay");

    if (walletButton) {
        walletButton.innerHTML = `
            <svg class="wallet-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <path d="M3 7.5C3 6.39543 3.89543 5.5 5 5.5H18.5C19.3284 5.5 20 6.17157 20 7V8.5H16.5C14.8431 8.5 13.5 9.84315 13.5 11.5C13.5 13.1569 14.8431 14.5 16.5 14.5H20V16.5C20 17.6046 19.1046 18.5 18 18.5H5C3.89543 18.5 3 17.6046 3 16.5V7.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M16.5 9H21V14H16.5C15.1193 14 14 12.8807 14 11.5C14 10.1193 15.1193 9 16.5 9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <circle cx="17.5" cy="11.5" r="0.9" fill="currentColor"/>
            </svg>
            <span>Disconnect Wallet</span>
        `;
        walletButton.classList.add("wallet-connected");
    }

    if (walletStatus) {
        walletStatus.textContent = `${address.slice(0, 6)}...${address.slice(-4)} - Rialo Testnet`;
        walletStatus.classList.add("connected");
    }

    if (lockOverlay) {
        lockOverlay.classList.add("hidden");
    }

    document.body.classList.remove("wallet-locked");
}

async function mintNftCard(code, button) {
    const card = getNftCardByCode(code);
    const tokenId = getNftTokenIdByCode(code);

    if (!card || !tokenId) {
        alert("NFT card not found.");
        return;
    }

    if (!window.ethereum) {
        alert("MetaMask is not installed.");
        return;
    }

    if (typeof ethers === "undefined") {
        alert("Ethers library not loaded.");
        return;
    }

    const defaultText = `Mint 1 NFT - ${card.priceRlo} RLO`;

    try {
        setMintButtonState(button, "Connecting Wallet...", true);

        await window.ethereum.request({ method: "eth_requestAccounts" });

        const switched = await ensureRialoTestnetForTransaction();
        if (!switched) {
            setMintButtonState(button, defaultText, false);
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();

        connectedWalletAddress = signerAddress;
        walletConnected = true;
        setWalletUiAfterMint(signerAddress);

        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
        const mintPriceWei = ethers.parseEther(NFT_REAL_MINT_PRICE_RLO);

        setMintButtonState(button, "Confirm in Wallet...", true);

        const tx = await contract.mint(tokenId, 1, {
            value: mintPriceWei
        });

        setMintButtonState(button, "Minting...", true);

        await tx.wait();

        updateProgressUI();
        renderPredictionHistory();
        await refreshNftUiState();

        const txUrl = `https://sepolia.basescan.org/tx/${tx.hash}`;

        setMintButtonState(button, "Minted Successfully", true);

        console.log("NFT minted successfully", {
            player: card.captain,
            country: card.country,
            tokenId,
            txHash: tx.hash,
            explorer: txUrl
        });
    } catch (error) {
        console.error("NFT mint failed:", error);

        if (error && (error.code === 4001 || error?.info?.error?.code === 4001)) {
            alert("Transaction rejected.");
        } else {
            alert(`Mint failed. If MetaMask confirmed but no NFT appeared, make sure the Rialo Testnet NFT contract mint price is exactly ${RIALO_REAL_NATIVE_TX_VALUE} and the address in the project is the latest deployed contract.`);
        }

        setMintButtonState(button, defaultText, false);
    }
}

function setupNftMintButtons() {
    document.querySelectorAll("#nft-collection-grid .nft-mint-btn").forEach(button => {
        const code = button.dataset.code;
        if (!code) return;

        const card = getNftCardByCode(code);
        if (!card) return;

        const defaultText = `Mint 1 NFT - ${card.priceRlo} RLO`;
        setMintButtonState(button, defaultText, false);

        button.onclick = async () => {
            await mintNftCard(code, button);
        };
    });
}

function setupRialoWorldCupNftPage() {
    const predictionBtn = document.getElementById("prediction-page-btn");
    const homeBtn = document.getElementById("home-page-btn");
    const swapBtn = document.getElementById("swap-page-btn");
    const nftBtn = document.getElementById("nft-page-btn");
    const marketBtn = document.getElementById("market-page-btn");

    const swapView = document.getElementById("swap-view");
    const nftView = document.getElementById("nft-view");
    const marketView = document.getElementById("market-view");
    const groupsView = document.getElementById("groups-view");
    const bracketView = document.getElementById("bracket-view");
    const groupsTab = document.getElementById("groups-tab-btn");
    const bracketTab = document.getElementById("bracket-tab-btn");

    if (!predictionBtn || !homeBtn || !swapBtn || !nftBtn || !marketBtn || !swapView || !nftView || !marketView || !groupsView) return;

    function playButtonEffect(button) {
        button.classList.remove("clicked");
        void button.offsetWidth;
        button.classList.add("clicked");

        setTimeout(() => {
            button.classList.remove("clicked");
        }, 850);
    }

    function showPredictionPage() {
        document.body.classList.remove("home-mode", "swap-mode", "nft-mode", "market-mode");

        swapView.classList.remove("active");
        nftView.classList.remove("active");
        marketView.classList.remove("active");
        groupsView.classList.add("active");

        if (bracketView) bracketView.classList.remove("active");
        if (groupsTab) groupsTab.classList.add("active");
        if (bracketTab) bracketTab.classList.remove("active");

        predictionBtn.classList.add("active");
        swapBtn.classList.remove("active");
        nftBtn.classList.remove("active");
        marketBtn.classList.remove("active");
        homeBtn.classList.remove("active");

        playButtonEffect(predictionBtn);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showSwapPage() {
        document.body.classList.remove("home-mode", "nft-mode", "market-mode");
        document.body.classList.add("swap-mode");

        groupsView.classList.remove("active");
        nftView.classList.remove("active");
        marketView.classList.remove("active");
        if (bracketView) bracketView.classList.remove("active");
        swapView.classList.add("active");

        if (groupsTab) groupsTab.classList.remove("active");
        if (bracketTab) bracketTab.classList.remove("active");

        swapBtn.classList.add("active");
        predictionBtn.classList.remove("active");
        nftBtn.classList.remove("active");
        marketBtn.classList.remove("active");
        homeBtn.classList.remove("active");

        if (window.refreshRialoSwapUi) {
            window.refreshRialoSwapUi();
        }

        playButtonEffect(swapBtn);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showNftPage() {
        document.body.classList.remove("home-mode", "swap-mode", "market-mode");
        document.body.classList.add("nft-mode");

        groupsView.classList.remove("active");
        swapView.classList.remove("active");
        marketView.classList.remove("active");
        if (bracketView) bracketView.classList.remove("active");
        nftView.classList.add("active");

        if (groupsTab) groupsTab.classList.remove("active");
        if (bracketTab) bracketTab.classList.remove("active");

        swapBtn.classList.remove("active");
        nftBtn.classList.add("active");
        predictionBtn.classList.remove("active");
        marketBtn.classList.remove("active");
        homeBtn.classList.remove("active");

        playButtonEffect(nftBtn);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showMarketPage() {
        document.body.classList.remove("home-mode", "swap-mode", "nft-mode");
        document.body.classList.add("market-mode");

        groupsView.classList.remove("active");
        swapView.classList.remove("active");
        nftView.classList.remove("active");
        if (bracketView) bracketView.classList.remove("active");
        marketView.classList.add("active");

        if (groupsTab) groupsTab.classList.remove("active");
        if (bracketTab) bracketTab.classList.remove("active");

        swapBtn.classList.remove("active");
        marketBtn.classList.add("active");
        nftBtn.classList.remove("active");
        predictionBtn.classList.remove("active");
        homeBtn.classList.remove("active");

        if (window.resetRialoMarketView) {
            window.resetRialoMarketView();
        }

        playButtonEffect(marketBtn);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    predictionBtn.onclick = showPredictionPage;
    swapBtn.onclick = showSwapPage;
    homeBtn.onclick = () => {
        document.body.classList.remove("swap-mode", "nft-mode", "market-mode");
        document.body.classList.add("home-mode");

        swapView.classList.remove("active");
        nftView.classList.remove("active");
        marketView.classList.remove("active");
        groupsView.classList.remove("active");
        if (bracketView) bracketView.classList.remove("active");
        if (groupsTab) groupsTab.classList.remove("active");
        if (bracketTab) bracketTab.classList.remove("active");

        homeBtn.classList.add("active");
        predictionBtn.classList.remove("active");
        swapBtn.classList.remove("active");
        nftBtn.classList.remove("active");
        marketBtn.classList.remove("active");

        playButtonEffect(homeBtn);

        const guide = document.getElementById("home-guide-section");
        if (guide) {
            guide.classList.remove("home-guide-focus");
            void guide.offsetWidth;
            guide.classList.add("home-guide-focus");
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => guide.classList.remove("home-guide-focus"), 1500);
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    nftBtn.onclick = showNftPage;
    marketBtn.onclick = showMarketPage;
}

function setupRialoSwapUi() {
    const refs = {
        view: document.getElementById("swap-view"),
        walletUsdc: document.getElementById("swap-wallet-usdc"),
        walletStableLabel: document.getElementById("swap-wallet-stable-label"),
        walletRlo: document.getElementById("swap-wallet-rlo"),
        poolUsdc: document.getElementById("swap-pool-usdc"),
        poolRlo: document.getElementById("swap-pool-rlo"),
        inputSideLabel: document.getElementById("swap-input-side-label"),
        outputSideLabel: document.getElementById("swap-output-side-label"),
        inputBalance: document.getElementById("swap-input-balance"),
        outputBalance: document.getElementById("swap-output-balance"),
        amountInput: document.getElementById("swap-amount-input"),
        inputFootnote: document.getElementById("swap-input-footnote"),
        outputFootnote: document.getElementById("swap-output-footnote"),
        outputAmount: document.getElementById("swap-output-amount"),
        inputTokenMark: document.getElementById("swap-input-token-mark"),
        inputTokenSymbol: document.getElementById("swap-input-token-symbol"),
        inputTokenName: document.getElementById("swap-input-token-name"),
        outputTokenMark: document.getElementById("swap-output-token-mark"),
        outputTokenSymbol: document.getElementById("swap-output-token-symbol"),
        outputTokenName: document.getElementById("swap-output-token-name"),
        quick20: document.getElementById("swap-quick-20"),
        quick50: document.getElementById("swap-quick-50"),
        quickMax: document.getElementById("swap-quick-max"),
        flipBtn: document.getElementById("swap-flip-btn"),
        rate: document.getElementById("swap-rate"),
        priceImpact: document.getElementById("swap-price-impact"),
        minReceived: document.getElementById("swap-min-received"),
        slippageGroup: document.getElementById("swap-slippage-group"),
        liveMode: document.getElementById("swap-live-mode"),
        faucetBtn: document.getElementById("swap-faucet-btn"),
        approveBtn: document.getElementById("swap-approve-btn"),
        seedToggleBtn: document.getElementById("swap-seed-toggle-btn"),
        seedPanel: document.getElementById("swap-seed-panel"),
        seedUsdc: document.getElementById("swap-seed-usdc"),
        seedRlo: document.getElementById("swap-seed-rlo"),
        seedBtn: document.getElementById("swap-seed-btn"),
        submitBtn: document.getElementById("swap-submit-btn"),
        swapTokenMenu: document.getElementById("swap-token-menu"),
        status: document.getElementById("swap-status")
    };

    if (
        !refs.view || !refs.walletUsdc || !refs.walletStableLabel || !refs.walletRlo || !refs.poolUsdc || !refs.poolRlo ||
        !refs.inputSideLabel || !refs.outputSideLabel || !refs.inputBalance || !refs.outputBalance ||
        !refs.amountInput || !refs.inputFootnote || !refs.outputFootnote || !refs.outputAmount ||
        !refs.inputTokenMark || !refs.swapTokenMenu || !refs.inputTokenSymbol || !refs.inputTokenName ||
        !refs.outputTokenMark || !refs.outputTokenSymbol || !refs.outputTokenName ||
        !refs.quick20 || !refs.quick50 || !refs.quickMax || !refs.flipBtn || !refs.rate ||
        !refs.priceImpact || !refs.minReceived || !refs.slippageGroup || !refs.liveMode ||
        !refs.faucetBtn || !refs.approveBtn || !refs.seedToggleBtn || !refs.seedPanel ||
        !refs.seedUsdc || !refs.seedRlo || !refs.seedBtn || !refs.submitBtn || !refs.status
    ) {
        return;
    }

    if (refs.view.dataset.swapUiReady === "1") {
        return;
    }

    refs.view.dataset.swapUiReady = "1";
    swapReady = true;

    const state = {
        mockUsdcArtifactPromise: null,
        mockUsdtArtifactPromise: null,
        swapArtifactPromise: null,
        validatedMockUsdcAddress: "",
        validatedMockUsdtAddress: "",
        validatedSwapAddress: "",
        validatedUsdtSwapAddress: "",
        slippageBps: 50,
        direction: "stable-to-rlo",
        activeStable: "USDC",
        walletUsdc: 0,
        walletUsdt: 0,
        walletRlo: 0,
        poolUsdc: 0,
        poolRlo: 0,
        expectedOutput: 0,
        currentAllowanceEnough: false,
        seedPanelOpen: false
    };

    function setStatus(message) {
        refs.status.textContent = message;
    }

    function normalizeAmountInput(value) {
        const raw = String(value || "").trim().replace(",", ".");
        const parts = raw.split(".");
        if (parts.length <= 1) {
            return raw.replace(/[^\d]/g, "");
        }
        return `${parts[0].replace(/[^\d]/g, "")}.${parts.slice(1).join("").replace(/[^\d]/g, "")}`;
    }

    function readNumber(value) {
        const clean = normalizeAmountInput(value);
        const num = Number(clean);
        return Number.isFinite(num) ? num : 0;
    }

    function formatCompactAmount(value, decimals = 4) {
        const num = Number(value || 0);
        if (num === 0) return "0";
        if (num >= 1000000) return `${(num / 1000000).toFixed(2).replace(/\.?0+$/, "")}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(2).replace(/\.?0+$/, "")}K`;
        if (num >= 1) return num.toFixed(Math.min(decimals, 4)).replace(/\.?0+$/, "");
        return num.toFixed(Math.max(decimals, 4)).replace(/0+$/, "").replace(/\.$/, "");
    }

    function getStableMeta(asset = state.activeStable) {
        const symbol = asset === "USDT" ? "USDT" : "USDC";
        return {
            symbol,
            artifactUrl: symbol === "USDT" ? RIALO_MOCK_USDT_ARTIFACT_URL : RIALO_MOCK_USDC_ARTIFACT_URL,
            tokenStorageKey: symbol === "USDT" ? RIALO_MOCK_USDT_STORAGE_KEY : RIALO_MOCK_USDC_STORAGE_KEY,
            swapStorageKey: symbol === "USDT" ? RIALO_USDT_SWAP_STORAGE_KEY : RIALO_USDC_SWAP_STORAGE_KEY,
            walletBalance: symbol === "USDT" ? state.walletUsdt : state.walletUsdc,
            priceUsd: symbol === "USDT" ? USDT_REFERENCE_USD_PRICE : USDC_REFERENCE_USD_PRICE
        };
    }

    function isStableAsset(asset) {
        return asset === "USDC" || asset === "USDT";
    }

    function formatStableAmount(value, asset = state.activeStable) {
        return `${formatCompactAmount(value, 2)} ${getStableMeta(asset).symbol}`;
    }

    function formatUsdcAmount(value) {
        return formatStableAmount(value, "USDC");
    }

    function formatRloAmount(value) {
        return `${formatCompactAmount(value, 6)} RLO`;
    }

    function getStoredMockUsdcAddress() {
        return localStorage.getItem(RIALO_MOCK_USDC_STORAGE_KEY) || "";
    }

    function setStoredMockUsdcAddress(address) {
        if (address) {
            localStorage.setItem(RIALO_MOCK_USDC_STORAGE_KEY, address);
        }
    }

    function getStoredStableAddress(asset = state.activeStable) {
        return localStorage.getItem(getStableMeta(asset).tokenStorageKey) || "";
    }

    function setStoredStableAddress(address, asset = state.activeStable) {
        if (address) {
            localStorage.setItem(getStableMeta(asset).tokenStorageKey, address);
        }
    }

    function getStoredSwapAddress(asset = state.activeStable) {
        return localStorage.getItem(getStableMeta(asset).swapStorageKey) || "";
    }

    function setStoredSwapAddress(address, asset = state.activeStable) {
        if (address) {
            localStorage.setItem(getStableMeta(asset).swapStorageKey, address);
        }
    }

    function getInputAsset() {
        return state.direction === "rlo-to-stable" ? "RLO" : state.activeStable;
    }
    function getOutputAsset() {
        return state.direction === "rlo-to-stable" ? state.activeStable : "RLO";
    }

    function getInputBalanceValue() {
        return isStableAsset(getInputAsset()) ? getStableMeta(getInputAsset()).walletBalance : state.walletRlo;
    }

    function getOutputBalanceValue() {
        return isStableAsset(getOutputAsset()) ? getStableMeta(getOutputAsset()).walletBalance : state.walletRlo;
    }

    function formatAssetAmount(asset, value) {
        return isStableAsset(asset) ? formatStableAmount(value, asset) : formatRloAmount(value);
    }

    function getSpotRate() {
    if (state.poolUsdc > 0 && state.poolRlo > 0) {
        return isStableAsset(getInputAsset())
            ? state.poolRlo / state.poolUsdc
            : state.poolUsdc / state.poolRlo;
    }

    return isStableAsset(getInputAsset())
        ? (getStableMeta(getInputAsset()).priceUsd / RLO_REFERENCE_USD_PRICE)
        : RLO_REFERENCE_USD_PRICE;
}

function getUsdEstimate(asset, amount) {
    const value = Number(amount || 0);
    if (!(value > 0)) {
        return "$0.00";
    }

    const usdValue = isStableAsset(asset)
        ? value * getStableMeta(asset).priceUsd
        : value * RLO_REFERENCE_USD_PRICE;

    return `$${formatCompactAmount(usdValue, 2)}`;
}

function getLocalSwapOutput(amount, inputAsset) {
    const value = Number(amount || 0);
    if (!(value > 0)) {
        return 0;
    }

    if (state.poolUsdc > 0 && state.poolRlo > 0) {
        const feeFactor = (10000 - 30) / 10000;

        if (isStableAsset(inputAsset)) {
            const amountInWithFee = value * feeFactor;
            return (amountInWithFee * state.poolRlo) / (state.poolUsdc + amountInWithFee);
        }

        const amountInWithFee = value * feeFactor;
        return (amountInWithFee * state.poolUsdc) / (state.poolRlo + amountInWithFee);
    }

    return 0;
}

function syncSeedPanel() {
        refs.seedPanel.hidden = !state.seedPanelOpen;
        refs.seedToggleBtn.classList.toggle("active", state.seedPanelOpen);
    }

    function closeSwapTokenMenu() {
        refs.swapTokenMenu.hidden = true;
        refs.inputTokenMark.closest(".swap-token-pill")?.setAttribute("aria-expanded", "false");
    }

    function toggleSwapTokenMenu() {
        const willOpen = refs.swapTokenMenu.hidden;
        refs.swapTokenMenu.hidden = !willOpen;
        refs.inputTokenMark.closest(".swap-token-pill")?.setAttribute("aria-expanded", String(willOpen));
    }

    function syncSlippageButtons() {
        refs.slippageGroup.querySelectorAll("[data-swap-slippage]").forEach(button => {
            button.classList.toggle("active", Number(button.dataset.swapSlippage || 0) === Number(state.slippageBps || 0) / 100);
        });
    }

    function setTokenPresentation(markEl, symbolEl, nameEl, asset) {
        const tokenMeta = {
            RLO: { symbol: "RLO", name: "Rialo Token", image: "rlo-token.png", fallback: "R" },
            USDC: { symbol: "USDC", name: "USDC", image: "usdc-token.png", fallback: "U" },
            USDT: { symbol: "USDT", name: "USDT", image: "usdt-token.png", fallback: "T" }
        };
        const meta = tokenMeta[asset] || tokenMeta.RLO;

        markEl.className = `swap-token-mark swap-token-mark-${meta.symbol.toLowerCase()}`;
        markEl.innerHTML = `<img src="${meta.image}" alt="${meta.symbol}" loading="lazy">`;
        const image = markEl.querySelector("img");
        if (image) {
            image.addEventListener("error", () => {
                markEl.textContent = meta.fallback;
            }, { once: true });
        }

        symbolEl.textContent = meta.symbol;
        nameEl.textContent = meta.name;
    }

    function syncDirectionUi() {
        const inputAsset = getInputAsset();
        const outputAsset = getOutputAsset();
        const stableSymbol = state.activeStable;

        refs.walletStableLabel.textContent = `Wallet ${stableSymbol}`;
        refs.inputSideLabel.textContent = "Sell";
        refs.outputSideLabel.textContent = "Buy";
        refs.inputBalance.textContent = `Balance: ${formatAssetAmount(inputAsset, getInputBalanceValue())}`;
        refs.outputBalance.textContent = `Balance: ${formatAssetAmount(outputAsset, getOutputBalanceValue())}`;
        refs.submitBtn.textContent = (walletConnected && !(state.poolUsdc > 0 && state.poolRlo > 0)) ? "Start Pool & Swap" : `Swap ${inputAsset} to ${outputAsset}`;
        refs.faucetBtn.textContent = `Get ${stableSymbol}`;
        refs.approveBtn.hidden = !isStableAsset(inputAsset);
        refs.approveBtn.textContent = state.currentAllowanceEnough ? `${stableSymbol} Ready` : `Approve ${stableSymbol}`;
        refs.flipBtn.setAttribute("aria-label", `Flip to ${outputAsset} -> ${inputAsset}`);

        const inputPill = refs.inputTokenMark.closest(".swap-token-pill");
        if (inputPill) {
            inputPill.classList.toggle("swap-token-pill-locked", !isStableAsset(inputAsset));
            inputPill.setAttribute("aria-haspopup", String(isStableAsset(inputAsset)));
        }

        setTokenPresentation(refs.inputTokenMark, refs.inputTokenSymbol, refs.inputTokenName, inputAsset);
        setTokenPresentation(refs.outputTokenMark, refs.outputTokenSymbol, refs.outputTokenName, outputAsset);
        syncSlippageButtons();
    }

    function updateQuoteUi() {
        const inputAsset = getInputAsset();
        const outputAsset = getOutputAsset();
        const inputAmount = readNumber(refs.amountInput.value);
        const slippageRate = state.slippageBps / 10000;
        const spotRate = getSpotRate();

        const poolReady = state.poolUsdc > 0 && state.poolRlo > 0;
        const displayOutput = state.expectedOutput > 0
            ? state.expectedOutput
            : (!poolReady && inputAmount > 0 && spotRate > 0 ? inputAmount * spotRate : 0);

        refs.outputAmount.textContent = displayOutput > 0
            ? formatCompactAmount(displayOutput, isStableAsset(outputAsset) ? 2 : 6)
            : "0";

        refs.inputFootnote.textContent = getUsdEstimate(inputAsset, inputAmount);
        refs.outputFootnote.textContent = getUsdEstimate(outputAsset, displayOutput);
        refs.rate.textContent = spotRate > 0
            ? `1 ${inputAsset} = ${formatCompactAmount(spotRate, isStableAsset(outputAsset) ? 2 : 6)} ${outputAsset}`
            : "Pool not ready";

        const inputBalance = getInputBalanceValue();
        const requiredWalletAmount = inputAmount > 0
            ? (inputAsset === "RLO" ? Number(RIALO_REAL_NATIVE_TX_VALUE) : Math.min(inputAmount, Number(SWAP_TEST_STABLE_TX_AMOUNT)))
            : 0;
        const amountTooHigh = inputAmount > 0 && inputBalance + 0.0000001 < requiredWalletAmount;
        refs.submitBtn.disabled = inputAmount <= 0 || amountTooHigh;

        if (amountTooHigh) {
            refs.priceImpact.textContent = "-";
            refs.minReceived.textContent = "Not enough balance";
            setStatus(`Not enough ${inputAsset}. Wallet only needs ${formatAssetAmount(inputAsset, requiredWalletAmount)} for this testnet confirmation. Available: ${formatAssetAmount(inputAsset, inputBalance)}.`);
            return;
        }

        if (inputAmount > 0 && !(state.poolUsdc > 0 && state.poolRlo > 0)) {
            refs.submitBtn.disabled = !walletConnected;
            refs.priceImpact.textContent = "-";
            refs.minReceived.textContent = "Pool seed first";
            setStatus(`Pool is empty. Press Start Pool & Swap to create first ${state.activeStable}/RLO liquidity.`);
            return;
        }

        if (inputAmount > 0 && displayOutput <= 0) {
            refs.submitBtn.disabled = true;
            refs.priceImpact.textContent = "-";
            refs.minReceived.textContent = "No route";
            setStatus("No swap route is ready yet. Seed the pool once, then every typed amount will quote normally.");
            return;
        }

        if (inputAmount > 0 && displayOutput > 0 && state.poolUsdc > 0 && state.poolRlo > 0) {
            const idealOut = isStableAsset(inputAsset)
                ? inputAmount * (state.poolRlo / state.poolUsdc)
                : inputAmount * (state.poolUsdc / state.poolRlo);
            const impact = idealOut > 0 ? ((idealOut - displayOutput) / idealOut) * 100 : 0;
            refs.priceImpact.textContent = `-${Math.abs(impact).toFixed(2)}%`;
            refs.minReceived.textContent = formatAssetAmount(outputAsset, displayOutput * (1 - slippageRate));
            return;
        }

        refs.priceImpact.textContent = "-";
        refs.minReceived.textContent = "-"
    }

    async function getMockStableArtifact(asset = state.activeStable) {
        const meta = getStableMeta(asset);
        const promiseKey = meta.symbol === "USDT" ? "mockUsdtArtifactPromise" : "mockUsdcArtifactPromise";
        if (!state[promiseKey]) {
            state[promiseKey] = fetch(meta.artifactUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Mock ${meta.symbol} artifact is not available.`);
                    }
                    return response.json();
                });
        }
        return state[promiseKey];
    }

    async function getSwapArtifact() {
        if (!state.swapArtifactPromise) {
            state.swapArtifactPromise = fetch(RIALO_USDC_SWAP_ARTIFACT_URL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Swap artifact is not available.");
                    }
                    return response.json();
                });
        }
        return state.swapArtifactPromise;
    }

    async function getValidatedContractAddress(provider, storedAddress, cacheKey) {
        const normalized = String(storedAddress || "").trim();
        if (!normalized) {
            return "";
        }

        const code = await provider.getCode(normalized);
        if (!code || code === "0x") {
            return "";
        }

        if (cacheKey === "USDT-token") {
            state.validatedMockUsdtAddress = normalized;
        } else if (cacheKey === "USDT-swap") {
            state.validatedUsdtSwapAddress = normalized;
        } else if (cacheKey === "USDC-token") {
            state.validatedMockUsdcAddress = normalized;
        } else if (cacheKey === "USDC-swap") {
            state.validatedSwapAddress = normalized;
        }

        return normalized;
    }

    async function getMockStableContract(target, allowDeploy = false, asset = state.activeStable) {
        const meta = getStableMeta(asset);
        const provider = target.provider || target;
        const cacheProp = meta.symbol === "USDT" ? "validatedMockUsdtAddress" : "validatedMockUsdcAddress";
        let address = state[cacheProp] || await getValidatedContractAddress(provider, getStoredStableAddress(meta.symbol), `${meta.symbol}-token`);

        if (!address && allowDeploy) {
            const artifact = await getMockStableArtifact(meta.symbol);
            const builder = new ethers.ContractFactory(artifact.abi, artifact.bytecode, target);
            setStatus(`Deploying ${meta.symbol} contract...`);
            const contract = await builder.deploy();
            await contract.waitForDeployment();
            address = await contract.getAddress();
            setStoredStableAddress(address, meta.symbol);
            state[cacheProp] = address;
            return contract;
        }

        if (!address) {
            return null;
        }

        const artifact = await getMockStableArtifact(meta.symbol);
        return new ethers.Contract(address, artifact.abi, target);
    }

    async function getStableSwapContract(target, allowDeploy = false, stableAddress = "", asset = state.activeStable) {
        const meta = getStableMeta(asset);
        const provider = target.provider || target;
        const cacheProp = meta.symbol === "USDT" ? "validatedUsdtSwapAddress" : "validatedSwapAddress";
        let address = state[cacheProp] || await getValidatedContractAddress(provider, getStoredSwapAddress(meta.symbol), `${meta.symbol}-swap`);

        if (!address && allowDeploy) {
            const artifact = await getSwapArtifact();
            const builder = new ethers.ContractFactory(artifact.abi, artifact.bytecode, target);
            setStatus(`Deploying Rialo ${meta.symbol} swap contract...`);
            const contract = await builder.deploy(stableAddress);
            await contract.waitForDeployment();
            address = await contract.getAddress();
            setStoredSwapAddress(address, meta.symbol);
            state[cacheProp] = address;
            return contract;
        }

        if (!address) {
            return null;
        }

        const artifact = await getSwapArtifact();
        return new ethers.Contract(address, artifact.abi, target);
    }

    async function ensureSwapContracts(target, allowDeploy = false) {
        const stable = await getMockStableContract(target, allowDeploy, state.activeStable);
        if (!stable) {
            return { stable: null, usdc: null, swap: null };
        }

        const stableAddress = await stable.getAddress();
        const swap = await getStableSwapContract(target, allowDeploy, stableAddress, state.activeStable);
        return { stable, usdc: stable, swap };
    }

    async function refreshQuoteFromChain(swap) {
        const amount = readNumber(refs.amountInput.value);
        const inputAsset = getInputAsset();
        const spotRate = getSpotRate();
        const displayQuote = amount > 0 && spotRate > 0 ? amount * spotRate : 0;

        if (!(amount > 0) || !swap || !(state.poolUsdc > 0 && state.poolRlo > 0)) {
            state.expectedOutput = 0;
            return;
        }

        state.expectedOutput = displayQuote;

        try {
            if (isStableAsset(inputAsset)) {
                const txStableAmount = Math.min(amount, Number(SWAP_TEST_STABLE_TX_AMOUNT));
                const quotedRloWei = await swap.previewUsdcToRlo(ethers.parseUnits(String(txStableAmount), 6));
                const chainQuote = Number(ethers.formatEther(quotedRloWei));
                state.expectedOutput = displayQuote > 0 ? displayQuote : chainQuote;
                return;
            }

            const quotedStableWei = await swap.previewRloToUsdc(ethers.parseEther(RIALO_REAL_NATIVE_TX_VALUE));
            const chainQuote = Number(ethers.formatUnits(quotedStableWei, 6));
            state.expectedOutput = displayQuote > 0 ? displayQuote : chainQuote;
        } catch (error) {
            console.warn("Swap quote preview failed:", error);
            state.expectedOutput = displayQuote;
        }
    }
    function setSwapLiveState(text, stateName = "bad") {
        refs.liveMode.textContent = text;
        const liveWrap = refs.liveMode.closest(".swap-widget-live");
        if (liveWrap) {
            liveWrap.classList.remove("swap-live-ok", "swap-live-bad", "swap-live-warn");
            liveWrap.classList.add(stateName === "ok" ? "swap-live-ok" : stateName === "warn" ? "swap-live-warn" : "swap-live-bad");
        }
    }

    async function syncSwapUi({ allowDeploy = false } = {}) {
        try {
            if (!window.ethereum) {
                setSwapLiveState("MetaMask not installed", "bad");
                setStatus("Install MetaMask to use the Rialo swap widget.");
                return;
            }

            if (!walletConnected || !connectedWalletAddress) {
                setSwapLiveState("Wallet not connected", "bad");
                refs.walletStableLabel.textContent = `Wallet ${state.activeStable}`;
                refs.walletUsdc.textContent = "-";
                refs.walletRlo.textContent = "-";
                refs.poolUsdc.textContent = "-";
                refs.poolRlo.textContent = "-";
                state.expectedOutput = 0;
                setStatus("Connect your wallet to use the swap.");
                syncDirectionUi();
                updateQuoteUi();
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const { stable, swap } = await ensureSwapContracts(provider, allowDeploy);

            if (!stable) {
                setSwapLiveState("Contracts deploy on first use", "warn");
                refs.walletStableLabel.textContent = `Wallet ${state.activeStable}`;
                refs.poolUsdc.textContent = `0 ${state.activeStable}`;
                refs.poolRlo.textContent = "0 RLO";
                state.expectedOutput = 0;
                setStatus(`Use Get ${state.activeStable}, then seed the pool once. Contracts deploy automatically on your first action.`);
                syncDirectionUi();
                updateQuoteUi();
                return;
            }

            const walletStableWei = await stable.balanceOf(connectedWalletAddress);
            const walletRloWei = await provider.getBalance(connectedWalletAddress);
            if (state.activeStable === "USDT") { state.walletUsdt = Number(ethers.formatUnits(walletStableWei, 6)); } else { state.walletUsdc = Number(ethers.formatUnits(walletStableWei, 6)); }
            state.walletRlo = Number(ethers.formatEther(walletRloWei));

            refs.walletStableLabel.textContent = `Wallet ${state.activeStable}`;
            refs.walletUsdc.textContent = formatStableAmount(getStableMeta().walletBalance, state.activeStable);
            refs.walletRlo.textContent = formatRloAmount(state.walletRlo);

            if (swap) {
                const swapAddress = await swap.getAddress();
                const allowanceWei = await stable.allowance(connectedWalletAddress, swapAddress);
                const poolStableWei = await stable.balanceOf(swapAddress);
                const poolRloWei = await provider.getBalance(swapAddress);

                state.currentAllowanceEnough = allowanceWei > 0n;
                state.poolUsdc = Number(ethers.formatUnits(poolStableWei, 6));
                state.poolRlo = Number(ethers.formatEther(poolRloWei));

                refs.poolUsdc.textContent = formatStableAmount(state.poolUsdc, state.activeStable);
                refs.poolRlo.textContent = formatRloAmount(state.poolRlo);
                setSwapLiveState(`Live on-chain - ${state.currentAllowanceEnough ? `${state.activeStable} approved` : "approval needed"}`, state.currentAllowanceEnough ? "ok" : "warn");

                await refreshQuoteFromChain(swap);

                if (!(state.poolUsdc > 0 && state.poolRlo > 0)) {
                    setStatus("The pool is empty. Seed the pool once to start getting live swap quotes.");
                } else {
                    setStatus("On-chain swap ready.");
                }
            } else {
                state.currentAllowanceEnough = false;
                state.poolUsdc = 0;
                state.poolRlo = 0;
                state.expectedOutput = 0;
                refs.walletStableLabel.textContent = `Wallet ${state.activeStable}`;
                refs.poolUsdc.textContent = `0 ${state.activeStable}`;
                refs.poolRlo.textContent = "0 RLO";
                setSwapLiveState("Pool not deployed yet", "warn");
                setStatus("Deploy or seed the pool once to start swapping.");
            }

            refs.seedUsdc.value = refs.seedUsdc.value || SWAP_DEFAULT_SEED_USDC;
            refs.seedRlo.value = refs.seedRlo.value || SWAP_DEFAULT_SEED_RLO;
            syncDirectionUi();
            updateQuoteUi();
            
        } catch (error) {
            console.error("Failed to sync swap UI:", error);
            setSwapLiveState("Swap temporarily unavailable", "bad");
            setStatus("Could not load the swap widget right now. Try again in a moment.");
        }
    }

    async function withSwapSigner(task) {
        if (!window.ethereum) {
            alert("MetaMask is not installed.");
            return;
        }

        const switched = await ensureRialoTestnetForTransaction();
        if (!switched) {
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        await task(provider, signer);
    }

    async function approveIfNeeded(usdcContract, spenderAddress, ownerAddress, amountWei) {
        const currentAllowance = await usdcContract.allowance(ownerAddress, spenderAddress);
        if (currentAllowance >= amountWei) {
            return null;
        }

        const tx = await usdcContract.approve(spenderAddress, ethers.MaxUint256);
        await tx.wait();
        return tx;
    }

    async function ensureSwapPoolReadyForTrade(provider, signer, stable, swap, walletAddress) {
        if (state.poolUsdc > 0 && state.poolRlo > 0) {
            return true;
        }

        if (!stable || !swap) {
            setStatus("Swap contracts are not ready yet. Use Get USDC first, then try again.");
            return false;
        }

        const stableBalanceWei = await stable.balanceOf(walletAddress);
        const rloBalanceWei = await provider.getBalance(walletAddress);
        const stableBalance = Number(ethers.formatUnits(stableBalanceWei, 6));
        const rloBalance = Number(ethers.formatEther(rloBalanceWei));
        const seedStable = Math.min(Number(SWAP_TEST_STABLE_TX_AMOUNT), stableBalance);
        const seedRlo = Math.min(Number(RIALO_REAL_NATIVE_TX_VALUE), rloBalance);

        if (!(seedStable > 0) || !(seedRlo > 0)) {
            setStatus(`Pool is empty. Claim ${state.activeStable} and keep at least ${RIALO_REAL_NATIVE_TX_VALUE} RLO for the first liquidity seed.`);
            return false;
        }

        const seedStableWei = ethers.parseUnits(seedStable.toFixed(6), 6);
        const seedRloWei = ethers.parseEther(RIALO_REAL_NATIVE_TX_VALUE);

        setStatus(`First use: approving ${state.activeStable} for the initial pool seed...`);
        await approveIfNeeded(stable, await swap.getAddress(), walletAddress, seedStableWei);

        setStatus("First use: confirm the small pool seed in MetaMask, then the swap will continue.");
        const tx = await swap.seedPool(seedStableWei, { value: seedRloWei });
        await tx.wait();
        setStatus(`Pool started with a small Rialo Testnet test transaction. Preparing swap quote...`);
        await syncSwapUi({ allowDeploy: false });
        return true;
    }
    refs.inputTokenMark.closest(".swap-token-pill")?.addEventListener("click", event => {
        event.stopPropagation();
        if (!isStableAsset(getInputAsset())) {
            closeSwapTokenMenu();
            setStatus("Flip the swap first, then choose USDC or USDT from the stable token side.");
            return;
        }
        toggleSwapTokenMenu();
    });

    refs.swapTokenMenu.addEventListener("click", event => {
        const option = event.target.closest("[data-swap-stable]");
        if (!option || option.disabled) return;

        const nextStable = option.dataset.swapStable === "USDT" ? "USDT" : "USDC";
        if (state.activeStable !== nextStable) {
            state.activeStable = nextStable;
            state.currentAllowanceEnough = false;
            state.expectedOutput = 0;
            refs.amountInput.value = "";
            refs.swapTokenMenu.querySelectorAll("[data-swap-stable]").forEach(item => {
                const isActive = item.dataset.swapStable === nextStable;
                item.classList.toggle("active", isActive);
                item.setAttribute("aria-selected", String(isActive));
            });
        }

        closeSwapTokenMenu();
        syncDirectionUi();
        syncSwapUi({ allowDeploy: false }).catch(error => {
            console.warn("Stable token switch refresh skipped:", error);
        });
    });

    document.addEventListener("click", closeSwapTokenMenu);
    refs.slippageGroup.querySelectorAll("[data-swap-slippage]").forEach(button => {
        button.addEventListener("click", () => {
            const slippage = Number(button.dataset.swapSlippage || 0.5);
            state.slippageBps = Math.round(slippage * 100);
            refs.slippageGroup.querySelectorAll(".swap-slippage-btn").forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            updateQuoteUi();
        });
    });

    refs.amountInput.addEventListener("input", () => {
        refs.amountInput.value = normalizeAmountInput(refs.amountInput.value);
        syncSwapUi({ allowDeploy: false }).catch(error => {
            console.warn("Swap quote refresh skipped:", error);
        });
    });

    [refs.quick20, refs.quick50, refs.quickMax].forEach(button => {
        button.addEventListener("click", () => {
            const percentage = Number(button.dataset.swapQuick || 0);
            const base = getInputBalanceValue();
            const value = percentage >= 100 ? base : (base * percentage) / 100;
            refs.amountInput.value = value > 0 ? String(Number(value.toFixed(isStableAsset(getInputAsset()) ? 6 : 8))) : "";
            syncSwapUi({ allowDeploy: false }).catch(error => {
                console.warn("Swap quick amount refresh skipped:", error);
            });
        });
    });

    refs.flipBtn.addEventListener("click", () => {
        state.direction = state.direction === "stable-to-rlo" ? "rlo-to-stable" : "stable-to-rlo";
        syncDirectionUi();
        syncSwapUi({ allowDeploy: false }).catch(error => {
            console.warn("Swap direction refresh skipped:", error);
        });
    });

    refs.seedToggleBtn.addEventListener("click", () => {
        state.seedPanelOpen = !state.seedPanelOpen;
        syncSeedPanel();
        syncDirectionUi();
    });

    refs.faucetBtn.addEventListener("click", async () => {
        await withSwapSigner(async (_, signer) => {
            const { stable } = await ensureSwapContracts(signer, true);
            setStatus(`Confirm the ${state.activeStable} faucet transaction in your wallet...`);
            const tx = await stable.faucet(ethers.parseUnits("1000", 6));
            await tx.wait();
            setStatus(`${state.activeStable} minted to your wallet.`);
            await syncSwapUi({ allowDeploy: false });
        });
    });

    refs.approveBtn.addEventListener("click", async () => {
        await withSwapSigner(async (_, signer) => {
            const { stable, swap } = await ensureSwapContracts(signer, true);
            const walletAddress = await signer.getAddress();
            setStatus(`Confirm the ${state.activeStable} approval transaction in your wallet...`);
            await approveIfNeeded(stable, await swap.getAddress(), walletAddress, ethers.parseUnits("1", 6));
            setStatus(`${state.activeStable} approval confirmed.`);
            await syncSwapUi({ allowDeploy: false });
        });
    });

    refs.seedBtn.addEventListener("click", async () => {
        await withSwapSigner(async (_, signer) => {
            const seedUsdc = readNumber(refs.seedUsdc.value);
            const seedRlo = readNumber(refs.seedRlo.value);

            if (seedUsdc <= 0 || seedRlo <= 0) {
                setStatus("Enter valid seed amounts for both USDC and RLO.");
                return;
            }

            const { stable, swap } = await ensureSwapContracts(signer, true);
            const walletAddress = await signer.getAddress();
            const seedUsdcWei = ethers.parseUnits(String(seedUsdc), 6);
            const seedRloWei = ethers.parseEther(RIALO_REAL_NATIVE_TX_VALUE);
            const walletUsdcWei = await stable.balanceOf(walletAddress);

            if (walletUsdcWei < seedUsdcWei) {
                setStatus(`Claim ${state.activeStable} first so you have enough to seed the pool.`);
                return;
            }

            const provider = signer.provider;
            const walletRloWei = await provider.getBalance(walletAddress);
            if (walletRloWei < seedRloWei) {
                setStatus("You do not have enough RLO in your wallet to seed this amount.");
                return;
            }

            setStatus(`Approving ${state.activeStable} for pool seeding...`);
            await approveIfNeeded(stable, await swap.getAddress(), walletAddress, seedUsdcWei);

            setStatus("Confirm the pool seed transaction in your wallet...");
            const tx = await swap.seedPool(seedUsdcWei, { value: seedRloWei });
            await tx.wait();
            setStatus(`Pool seeded with ${formatStableAmount(seedUsdc, state.activeStable)} and ${formatRloAmount(seedRlo)}.`);
            await syncSwapUi({ allowDeploy: false });
        });
    });

    refs.submitBtn.addEventListener("click", async () => {
        await withSwapSigner(async (provider, signer) => {
            const inputAsset = getInputAsset();
            const outputAsset = getOutputAsset();
            const inputAmount = readNumber(refs.amountInput.value);

            if (inputAmount <= 0) {
                setStatus(`Enter a valid ${inputAsset} amount first.`);
                return;
            }

            refs.submitBtn.disabled = true;
            const { stable, swap } = await ensureSwapContracts(signer, true);
            const walletAddress = await signer.getAddress();
            const deadline = Math.floor(Date.now() / 1000) + 600;
            const poolReady = await ensureSwapPoolReadyForTrade(provider, signer, stable, swap, walletAddress);
            if (!poolReady) {
                updateQuoteUi();
                return;
            }

            if (isStableAsset(inputAsset)) {
                const txStableAmount = Math.min(inputAmount, Number(SWAP_TEST_STABLE_TX_AMOUNT));
                const amountUsdcWei = ethers.parseUnits(String(txStableAmount), 6);
                const walletUsdcWei = await stable.balanceOf(walletAddress);

                if (walletUsdcWei < amountUsdcWei) {
                    setStatus(`You do not have enough ${state.activeStable} in your wallet for this swap.`);
                    return;
                }

                const quotedRloWei = await swap.previewUsdcToRlo(amountUsdcWei);
                if (quotedRloWei <= 0n) {
                    setStatus("The pool does not have enough liquidity yet to return RLO.");
                    return;
                }

                const minRloOut = quotedRloWei * BigInt(10000 - state.slippageBps) / 10000n;
                setStatus(`Approving ${inputAsset} and preparing your ${inputAsset} -> ${outputAsset} swap...`);
                await approveIfNeeded(stable, await swap.getAddress(), walletAddress, amountUsdcWei);

                setStatus(`Confirm the ${inputAsset} -> ${outputAsset} swap in your wallet.`);
                const tx = await swap.swapUsdcForRlo(amountUsdcWei, minRloOut, deadline);
                await tx.wait();
                refs.amountInput.value = "";
                setStatus(`Swap confirmed on-chain with a small Rialo Testnet test transaction. Display quote: ${formatStableAmount(inputAmount, state.activeStable)} -> ${formatRloAmount(inputAmount * 2)}.`);
                await syncSwapUi({ allowDeploy: false });
                return;
            }

            const amountRloWei = ethers.parseEther(RIALO_REAL_NATIVE_TX_VALUE);
            const walletRloWei = await provider.getBalance(walletAddress);
            if (walletRloWei < amountRloWei) {
                setStatus("You do not have enough RLO in your wallet for this swap.");
                return;
            }

            const quotedUsdcWei = await swap.previewRloToUsdc(amountRloWei);
            if (quotedUsdcWei <= 0n) {
                setStatus("The pool does not have enough liquidity yet to return the selected stable token.");
                return;
            }

            const minUsdcOut = quotedUsdcWei * BigInt(10000 - state.slippageBps) / 10000n;
            setStatus(`Confirm the ${inputAsset} -> ${outputAsset} swap in your wallet.`);
            const tx = await swap.swapRloForUsdc(minUsdcOut, deadline, { value: amountRloWei });
            await tx.wait();
            refs.amountInput.value = "";
            setStatus(`Swap confirmed on-chain with a small Rialo Testnet test transaction. Display quote: ${formatRloAmount(inputAmount)} -> ${formatStableAmount(inputAmount * 0.5, state.activeStable)}.`);
            await syncSwapUi({ allowDeploy: false });
        });
    });

    window.refreshRialoSwapUi = async () => {
        await syncSwapUi({ allowDeploy: false });
    };

    syncSeedPanel();
    syncDirectionUi();
    updateQuoteUi();

    syncSwapUi({ allowDeploy: false }).catch(error => {
        console.warn("Initial swap UI sync skipped:", error);
    });
}

function setupRialoMarketUi() {
    const refs = {
        strip: document.getElementById("market-trending-strip"),
        grid: document.getElementById("market-token-grid"),
        defaultView: document.getElementById("market-view-default"),
        tokenScreen: document.getElementById("market-token-screen"),
        portfolioCard: document.getElementById("market-portfolio-card"),
        portfolioSyncNote: document.getElementById("market-portfolio-sync-note"),
        portfolioTotalValue: document.getElementById("market-portfolio-total-value"),
        portfolioWalletRlo: document.getElementById("market-portfolio-wallet-rlo"),
        portfolioTokenValue: document.getElementById("market-portfolio-token-value"),
        portfolioPositionCount: document.getElementById("market-portfolio-position-count"),
        portfolioPnlRow: document.getElementById("market-portfolio-pnl-row"),
        portfolioPnl: document.getElementById("market-portfolio-pnl"),
        portfolioHoldings: document.getElementById("market-portfolio-holdings"),
        modal: document.getElementById("market-create-modal"),
        openMain: document.getElementById("open-market-create-btn"),
        openSide: document.getElementById("open-market-create-btn-side"),
        closeModal: document.getElementById("close-market-create-btn"),
        backBtn: document.getElementById("market-detail-back-btn"),
        form: document.getElementById("market-create-form"),
        status: document.getElementById("market-create-status"),
        name: document.getElementById("market-create-name"),
        symbol: document.getElementById("market-create-symbol"),
        price: document.getElementById("market-create-price"),
        seedLiquidity: document.getElementById("market-create-seed-liquidity"),
        supply: document.getElementById("market-create-supply"),
        imageInput: document.getElementById("market-create-image"),
        imageName: document.getElementById("market-create-image-name"),
        imagePreview: document.getElementById("market-create-image-preview"),
        description: document.getElementById("market-create-description"),
        website: document.getElementById("market-create-website"),
        detailOrb: document.getElementById("market-detail-orb"),
        detailHero: document.getElementById("market-detail-hero"),
        detailHeroImage: document.getElementById("market-detail-hero-image"),
        detailSymbol: document.getElementById("market-detail-symbol"),
        detailName: document.getElementById("market-detail-name"),
        detailDescription: document.getElementById("market-detail-description"),
        detailPrice: document.getElementById("market-detail-price"),
        detailMcap: document.getElementById("market-detail-mcap"),
        detailVolume: document.getElementById("market-detail-volume"),
        detailHolders: document.getElementById("market-detail-holders"),
        detailSupply: document.getElementById("market-detail-supply"),
        detailWebsite: document.getElementById("market-detail-website"),
        detailLiquidity: document.getElementById("market-detail-liquidity"),
        detailPoolToken: document.getElementById("market-detail-pool-token"),
        detailFee: document.getElementById("market-detail-fee"),
        detailContract: document.getElementById("market-detail-contract"),
        detailCreator: document.getElementById("market-detail-creator"),
        detailContractLink: document.getElementById("market-detail-contract-link"),
        detailLaunchLink: document.getElementById("market-detail-launch-link"),
        detailCreatorLink: document.getElementById("market-detail-creator-link"),
        chartLabel: document.getElementById("market-chart-label"),
        chartCard: document.getElementById("market-chart-card"),
        chartPriceNow: document.getElementById("market-chart-price-now"),
        chartPriceChange: document.getElementById("market-chart-price-change"),
        chartLiveStatus: document.getElementById("market-chart-live-status"),
        chartVisual: document.getElementById("market-chart-visual"),
        chartZoomOut: document.getElementById("market-chart-zoom-out"),
        chartZoomIn: document.getElementById("market-chart-zoom-in"),
        chartZoomReadout: document.getElementById("market-chart-zoom-readout"),
        tradeSymbol: document.getElementById("market-trade-symbol"),
        walletRloBalance: document.getElementById("market-wallet-rlo-balance"),
        walletTokenBalance: document.getElementById("market-wallet-token-balance"),
        walletBalanceNote: document.getElementById("market-wallet-balance-note"),
        tradeModeBuy: document.getElementById("market-trade-mode-buy"),
        tradeModeSell: document.getElementById("market-trade-mode-sell"),
        tradeAmount: document.getElementById("market-trade-amount"),
        buyPreviewRow: document.getElementById("market-buy-preview-row"),
        buyPreviewAmount: document.getElementById("market-buy-preview-amount"),
        buyPreviewImpact: document.getElementById("market-buy-preview-impact"),
        sellPreviewRow: document.getElementById("market-sell-preview-row"),
        sellPreviewAmount: document.getElementById("market-sell-preview-amount"),
        sellPreviewImpact: document.getElementById("market-sell-preview-impact"),
        previewMinLabel: document.getElementById("market-preview-min-label"),
        previewMinReceived: document.getElementById("market-preview-min-received"),
        previewExecutionPrice: document.getElementById("market-preview-execution-price"),
        previewSlippage: document.getElementById("market-preview-slippage"),
        lastTxCard: document.getElementById("market-last-tx-card"),
        lastTxLink: document.getElementById("market-last-tx-link"),
        tradeStatus: document.getElementById("market-trade-status"),
        feedCard: document.getElementById("market-feed-card"),
        tradeFeed: document.getElementById("market-trade-feed"),
        myTradesCard: document.getElementById("market-my-trades-card"),
        myTradesNote: document.getElementById("market-my-trades-note"),
        myTradesFeed: document.getElementById("market-my-trades-feed"),
        buyBtn: document.getElementById("market-buy-btn"),
        sellBtn: document.getElementById("market-sell-btn")
    };

    if (
        !refs.strip || !refs.grid || !refs.defaultView || !refs.tokenScreen || !refs.portfolioCard || !refs.portfolioSyncNote || !refs.portfolioTotalValue || !refs.portfolioWalletRlo || !refs.portfolioTokenValue || !refs.portfolioPositionCount || !refs.portfolioPnlRow || !refs.portfolioPnl || !refs.portfolioHoldings || !refs.modal ||
        !refs.openMain || !refs.openSide || !refs.closeModal || !refs.backBtn ||
        !refs.form || !refs.status || !refs.name || !refs.symbol || !refs.price ||
        !refs.seedLiquidity || !refs.supply || !refs.description || !refs.website || !refs.detailOrb ||
        !refs.detailHero || !refs.detailHeroImage || !refs.detailSymbol || !refs.detailName || !refs.detailDescription ||
        !refs.detailPrice || !refs.detailMcap || !refs.detailVolume ||
        !refs.detailHolders || !refs.detailSupply || !refs.detailWebsite || !refs.detailLiquidity ||
        !refs.detailPoolToken || !refs.detailFee || !refs.detailContract || !refs.detailCreator ||
        !refs.detailContractLink || !refs.detailLaunchLink || !refs.detailCreatorLink ||
        !refs.chartLabel || !refs.chartCard || !refs.chartPriceNow || !refs.chartPriceChange || !refs.chartLiveStatus || !refs.chartVisual || !refs.chartZoomOut || !refs.chartZoomIn || !refs.chartZoomReadout || !refs.tradeSymbol ||
        !refs.walletRloBalance || !refs.walletTokenBalance || !refs.walletBalanceNote ||
        !refs.tradeModeBuy || !refs.tradeModeSell || !refs.tradeAmount || !refs.buyPreviewRow || !refs.buyPreviewAmount || !refs.buyPreviewImpact || !refs.sellPreviewRow || !refs.sellPreviewAmount || !refs.sellPreviewImpact || !refs.previewMinLabel || !refs.previewMinReceived || !refs.previewExecutionPrice || !refs.previewSlippage || !refs.lastTxCard || !refs.lastTxLink || !refs.tradeStatus || !refs.feedCard || !refs.tradeFeed || !refs.myTradesCard || !refs.myTradesNote || !refs.myTradesFeed ||
        !refs.buyBtn || !refs.sellBtn
    ) {
        return;
    }

    if (refs.grid.dataset.marketUiReady === "1") {
        return;
    }

    refs.grid.dataset.marketUiReady = "1";
    refs.modal.hidden = true;
    refs.tokenScreen.hidden = true;
    refs.defaultView.hidden = false;

    const state = {
        filter: "latest",
        activeTokenId: null,
        activeToken: null,
        tokens: [],
        pollingHandle: null,
        chainRloBalance: null,
        factoryArtifactPromise: null,
        pendingCreateImage: "",
        activeTokenCandles: [],
        chartZoom: 1,
        chartTimeframe: "1m",
        lastRefreshAt: 0,
        validatedFactoryAddress: "",
        tradeMode: "buy",
        slippageBps: 100,
        lastTradeTxHash: "",
        portfolio: null
    };

    function stripMarketZeros(value) {
        return String(value).replace(/\.?0+$/, "");
    }

    function formatCompact(value, decimals = 2) {
        const num = Number(value || 0);

        if (!Number.isFinite(num)) {
            return "0";
        }

        const sign = num < 0 ? "-" : "";
        const abs = Math.abs(num);

        if (abs === 0) return "0";
        if (abs >= 1000000000) return `${sign}${stripMarketZeros((abs / 1000000000).toFixed(2))}B`;
        if (abs >= 1000000) return `${sign}${stripMarketZeros((abs / 1000000).toFixed(2))}M`;
        if (abs >= 1000) return `${sign}${stripMarketZeros((abs / 1000).toFixed(1))}K`;
        if (abs >= 100) return `${sign}${stripMarketZeros(abs.toFixed(0))}`;
        if (abs >= 10) return `${sign}${stripMarketZeros(abs.toFixed(2))}`;
        if (abs >= 1) return `${sign}${stripMarketZeros(abs.toFixed(Math.max(0, decimals)))}`;
        if (abs >= 0.01) return `${sign}${stripMarketZeros(abs.toFixed(Math.max(2, decimals)))}`;
        return `${sign}${stripMarketZeros(abs.toFixed(6))}`;
    }
    function formatPrice(value) {
        return `${Number(value || 0).toFixed(4)} RLO`;
    }

    function formatTokenChartPrice(value, token = state.activeToken) {
        const symbol = String(token?.symbol || "TOKEN").toUpperCase();
        return `${Number(value || 0).toFixed(4)} ${symbol}`;
    }

    function tokenOrb(symbol) {
        return String(symbol || "TK").slice(0, 2).toUpperCase();
    }

    function formatChartNumber(value) {
        const num = Number(value || 0);

        if (num >= 1) {
            return num.toFixed(2);
        }

        if (num >= 0.1) {
            return num.toFixed(4);
        }

        if (num >= 0.001) {
            return num.toFixed(6);
        }

        return num.toFixed(8);
    }

    function chartSpansMultipleDays(candles) {
        if (!Array.isArray(candles) || candles.length < 2) {
            return false;
        }

        const firstDate = new Date(candles[0]?.timestamp || 0);
        const lastDate = new Date(candles[candles.length - 1]?.timestamp || 0);

        if (Number.isNaN(firstDate.getTime()) || Number.isNaN(lastDate.getTime())) {
            return false;
        }

        return firstDate.toDateString() !== lastDate.toDateString();
    }

    function formatChartTimeLabel(value, options = {}) {
        if (!value) {
            return "";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const locale = typeof navigator !== "undefined" && navigator.language ? navigator.language : undefined;
        const includeDate = Boolean(options.includeDate);

        const time = new Intl.DateTimeFormat(locale, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(date).replace(/\s/g, "");

        if (!includeDate) {
            return time;
        }

        const day = new Intl.DateTimeFormat(locale, {
            day: "2-digit",
            month: "short"
        }).format(date);

        return `${day} ${time}`;
    }

    function shortWallet(address) {
        const safe = String(address || "").trim();
        if (!safe || safe.length < 10) {
            return "";
        }

        return `${safe.slice(0, 6)}...${safe.slice(-4)}`;
    }

    function formatPercent(value) {
        const num = Number(value || 0);
        const sign = num > 0 ? "+" : "";
        return `${sign}${num.toFixed(2)}%`;
    }

    function formatSignedRlo(value) {
        const num = Number(value || 0);
        const sign = num > 0 ? "+" : "";
        return `${sign}${formatCompact(Math.abs(num))} RLO`;
    }

    function getActiveTradeMode() {
        return state.tradeMode === "sell" ? "sell" : "buy";
    }

    function getSelectedSlippageRate() {
        return Math.max(0, Number(state.slippageBps || 0)) / 10000;
    }

    function syncSlippageButtons() {
        document.querySelectorAll("[data-market-slippage]").forEach(button => {
            button.classList.toggle("active", Number(button.dataset.marketSlippage || 0) === Number(state.slippageBps || 0));
        });
    }

    function syncTradeModeUi() {
        const mode = getActiveTradeMode();
        const tokenSymbol = refs.tradeSymbol.textContent || "TOKEN";
        const isBuy = mode === "buy";

        refs.tradeModeBuy.classList.toggle("active", isBuy);
        refs.tradeModeSell.classList.toggle("active", !isBuy);
        refs.buyPreviewRow.classList.toggle("active", isBuy);
        refs.sellPreviewRow.classList.toggle("active", !isBuy);
        refs.buyBtn.classList.toggle("is-primary", isBuy);
        refs.sellBtn.classList.toggle("is-primary", !isBuy);
        refs.tradeAmount.placeholder = isBuy
            ? "Buy: amount in RLO"
            : `Sell: amount in ${tokenSymbol}`;
        const buyPreviewLabel = refs.buyPreviewRow?.querySelector(".market-order-preview-copy span");
        const sellPreviewLabel = refs.sellPreviewRow?.querySelector(".market-order-preview-copy span");
        if (buyPreviewLabel) buyPreviewLabel.textContent = `Buy ${tokenSymbol} Preview`;
        if (sellPreviewLabel) sellPreviewLabel.textContent = `Sell ${tokenSymbol} Preview`;
        refs.previewMinLabel.textContent = isBuy ? "Minimum received" : "Minimum return";
        refs.previewSlippage.textContent = `${(Number(state.slippageBps || 0) / 100).toFixed(1)}%`;

        const buyQuickButtons = document.querySelectorAll('.market-quick-amount-btn[data-market-quick="buy"], .market-quick-amount-btn[data-market-quick="buy-max"]');
        const sellQuickButtons = document.querySelectorAll('.market-quick-amount-btn[data-market-quick="sell"]');
        buyQuickButtons.forEach(button => button.classList.toggle("group-active", isBuy));
        sellQuickButtons.forEach(button => button.classList.toggle("group-active", !isBuy));

        syncSlippageButtons();
    }

    function setTradeMode(mode = "buy") {
        state.tradeMode = String(mode || "").toLowerCase() === "sell" ? "sell" : "buy";
        syncTradeModeUi();
        refreshTradePreview();
    }

    function pulseElement(element, className = "market-surface-refresh", duration = 1050) {
        if (!element) {
            return;
        }

        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);

        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }

    function pulseValueChange(element, previousValue, nextValue) {
        if (!element) {
            return;
        }

        const prev = Number(previousValue);
        const next = Number(nextValue);

        if (!Number.isFinite(prev) || !Number.isFinite(next) || Math.abs(next - prev) < 0.0000001) {
            return;
        }

        const directionClass = next > prev ? "market-value-up" : "market-value-down";
        element.classList.remove("market-value-up", "market-value-down");
        void element.offsetWidth;
        element.classList.add(directionClass);

        setTimeout(() => {
            element.classList.remove("market-value-up", "market-value-down");
        }, 1250);
    }

    function updateLiveStatus(label = "Live market") {
        refs.chartLiveStatus.textContent = label;
        state.lastRefreshAt = Date.now();
    }

    function getExplorerBaseUrl() {
        return Array.isArray(RIALO_TESTNET?.blockExplorerUrls) && RIALO_TESTNET.blockExplorerUrls[0]
            ? String(RIALO_TESTNET.blockExplorerUrls[0]).replace(/\/+$/, "")
            : "";
    }

    function setMarketLink(element, href, label) {
        if (!element) {
            return;
        }

        const safeLabel = label || "Unavailable";
        element.textContent = safeLabel;

        if (href) {
            element.href = href;
            element.removeAttribute("aria-disabled");
            element.classList.remove("disabled");
        } else {
            element.href = "#";
            element.setAttribute("aria-disabled", "true");
            element.classList.add("disabled");
        }
    }

    function setLastTradeLink(txHash = "", label = "") {
        const explorerBaseUrl = getExplorerBaseUrl();
        const href = txHash && explorerBaseUrl ? `${explorerBaseUrl}/tx/${txHash}` : "";
        const linkLabel = label || (txHash ? `View ${shortWallet(txHash)}` : "Awaiting trade confirmation");
        setMarketLink(refs.lastTxLink, href, linkLabel);
    }

    function syncChartTimeframeButtons() {
        document.querySelectorAll("[data-market-timeframe]").forEach(button => {
            button.classList.toggle("active", (button.dataset.marketTimeframe || "") === state.chartTimeframe);
        });
    }

    function groupCandlesByMinutes(candles, minutes) {
        if (!Array.isArray(candles) || !candles.length || minutes <= 1) {
            return Array.isArray(candles) ? [...candles] : [];
        }

        const bucketMs = minutes * 60 * 1000;
        const buckets = [];

        candles.forEach(candle => {
            const time = new Date(candle.timestamp || Date.now()).getTime();
            const bucketStart = Math.floor(time / bucketMs) * bucketMs;
            const lastBucket = buckets[buckets.length - 1];

            if (!lastBucket || lastBucket.bucketStart !== bucketStart) {
                buckets.push({
                    bucketStart,
                    open: Number(candle.open || candle.close || 0),
                    high: Number(candle.high || candle.close || 0),
                    low: Number(candle.low || candle.close || 0),
                    close: Number(candle.close || candle.open || 0),
                    timestamp: candle.timestamp
                });
                return;
            }

            lastBucket.high = Math.max(lastBucket.high, Number(candle.high || candle.close || 0));
            lastBucket.low = Math.min(lastBucket.low, Number(candle.low || candle.close || 0));
            lastBucket.close = Number(candle.close || lastBucket.close || 0);
            lastBucket.timestamp = candle.timestamp;
        });

        return buckets.map((candle, index, arr) => ({
            index,
            open: Number(candle.open.toFixed(6)),
            high: Number(candle.high.toFixed(6)),
            low: Number(candle.low.toFixed(6)),
            close: Number(candle.close.toFixed(6)),
            timestamp: candle.timestamp,
            direction: candle.close >= (index > 0 ? arr[index - 1].close : candle.open) ? "up" : "down"
        }));
    }

    function getDisplayCandles(candles) {
        const source = Array.isArray(candles) ? candles : [];

        if (state.chartTimeframe === "5m") {
            return groupCandlesByMinutes(source, 5);
        }

        if (state.chartTimeframe === "15m") {
            return groupCandlesByMinutes(source, 15);
        }

        if (state.chartTimeframe === "all") {
            return [...source];
        }

        return groupCandlesByMinutes(source, 1);
    }

    function setChartTimeframe(timeframe) {
        state.chartTimeframe = timeframe || "1m";
        syncChartTimeframeButtons();

        if (state.activeToken) {
            buildChart(state.activeTokenCandles || []);
            refreshChartHeadline();
        }
    }

    function setCreateImageName(label = "") {
        if (!refs.imageName) {
            return;
        }

        const fileLabel = label || "No file selected";
        refs.imageName.textContent = fileLabel;
        refs.imageName.title = fileLabel;
    }

    function setCreateImagePreview(imageUrl = "", label = "") {
        if (!refs.imagePreview) {
            return;
        }

        if (!imageUrl) {
            setCreateImageName();
            refs.imagePreview.innerHTML = `<span>No file selected yet.</span>`;
            return;
        }

        setCreateImageName(label || "Selected meme image");
        refs.imagePreview.innerHTML = `
            <img src="${escapeHTML(imageUrl)}" alt="Meme token preview">
        `;
    }

    function resetCreateImageState() {
        state.pendingCreateImage = "";

        if (refs.imageInput) {
            refs.imageInput.value = "";
        }

        setCreateImagePreview();
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Failed to read the selected image."));
            reader.readAsDataURL(file);
        });
    }

    function updateChartZoomReadout() {
        refs.chartZoomReadout.textContent = `${Math.round(state.chartZoom * 100)}%`;
    }

    function changeChartZoom(direction) {
        const nextZoom = Number((state.chartZoom + direction * 0.2).toFixed(2));
        state.chartZoom = Math.max(0.8, Math.min(2.6, nextZoom));
        updateChartZoomReadout();

        if (state.activeToken) {
            buildChart(state.activeTokenCandles || []);
        }
    }

    function estimateTradeOutput(token, side, amount) {
        if (!token?.pool) {
            return null;
        }

        const normalizedSide = String(side || "").toUpperCase();
        const tradeAmount = Number(amount || 0);
        const feeBps = Number(token.pool.feeBps || 0);
        const feeMultiplier = (10_000 - feeBps) / 10_000;
        const poolRloReserve = Number(token.pool.rloReserve || 0);
        const poolTokenReserve = Number(token.pool.tokenReserve || 0);
        const virtualRloReserve = Number(token.pool.virtualRloReserve || poolRloReserve || 0);
        const virtualTokenReserve = Number(token.pool.virtualTokenReserve || poolTokenReserve || 0);

        if (tradeAmount <= 0 || poolRloReserve <= 0 || poolTokenReserve <= 0 || virtualRloReserve <= 0 || virtualTokenReserve <= 0) {
            return null;
        }

        const k = virtualRloReserve * virtualTokenReserve;
        const spotPrice = Number(token.price || 0);

        if (normalizedSide === "BUY") {
            const effectiveRloIn = tradeAmount * feeMultiplier;
            const nextVirtualRloReserve = virtualRloReserve + effectiveRloIn;
            const nextVirtualTokenReserve = k / nextVirtualRloReserve;
            const tokenOut = virtualTokenReserve - nextVirtualTokenReserve;

            let safeTokenOut = tokenOut;
            if (!Number.isFinite(safeTokenOut) || safeTokenOut <= 0 || safeTokenOut >= poolTokenReserve) {
                const fallbackPrice = spotPrice > 0 ? spotPrice : (poolRloReserve / Math.max(poolTokenReserve, 1));
                safeTokenOut = Math.min(tradeAmount / Math.max(fallbackPrice, 0.000001), poolTokenReserve * 0.92);
            }

            if (!Number.isFinite(safeTokenOut) || safeTokenOut <= 0) {
                return null;
            }

            const executionPrice = tradeAmount / safeTokenOut;
            const impact = spotPrice > 0 ? ((executionPrice - spotPrice) / spotPrice) * 100 : 0;

            return {
                amountRlo: Number(tradeAmount.toFixed(6)),
                amountToken: Number(safeTokenOut.toFixed(6)),
                executionPrice: Number(executionPrice.toFixed(6)),
                priceImpact: Number(impact.toFixed(2))
            };
        }

        if (normalizedSide === "SELL") {
            const effectiveTokenIn = tradeAmount * feeMultiplier;
            const nextVirtualTokenReserve = virtualTokenReserve + effectiveTokenIn;
            const nextVirtualRloReserve = k / nextVirtualTokenReserve;
            const rloOut = virtualRloReserve - nextVirtualRloReserve;

            let safeRloOut = rloOut;
            if (!Number.isFinite(safeRloOut) || safeRloOut <= 0 || safeRloOut >= poolRloReserve) {
                const fallbackPrice = spotPrice > 0 ? spotPrice : (poolRloReserve / Math.max(poolTokenReserve, 1));
                safeRloOut = Math.min(tradeAmount * fallbackPrice, poolRloReserve * 0.92);
            }

            if (!Number.isFinite(safeRloOut) || safeRloOut <= 0) {
                return null;
            }

            const executionPrice = safeRloOut / tradeAmount;
            const impact = spotPrice > 0 ? ((executionPrice - spotPrice) / spotPrice) * 100 : 0;

            return {
                amountRlo: Number(safeRloOut.toFixed(6)),
                amountToken: Number(tradeAmount.toFixed(6)),
                executionPrice: Number(executionPrice.toFixed(6)),
                priceImpact: Number(impact.toFixed(2))
            };
        }

        return null;
    }

    function refreshTradePreview() {
        const token = state.activeToken;
        const amount = parseDecimalInput(refs.tradeAmount);
        const symbol = token?.symbol || "TOKEN";
        const mode = getActiveTradeMode();
        const activePreview = amount > 0 ? estimateTradeOutput(token, mode.toUpperCase(), amount) : null;

        if (!token || !amount || amount <= 0) {
            refs.buyPreviewAmount.textContent = "Enter RLO amount";
            refs.buyPreviewImpact.textContent = "Impact -";
            refs.sellPreviewAmount.textContent = `Enter ${symbol} amount`;
            refs.sellPreviewImpact.textContent = "Impact -";
            refs.previewMinReceived.textContent = "-";
            refs.previewExecutionPrice.textContent = "-";
            refs.previewSlippage.textContent = `${(Number(state.slippageBps || 0) / 100).toFixed(1)}%`;
            return;
        }

        const buyPreview = estimateTradeOutput(token, "BUY", amount);
        const sellPreview = estimateTradeOutput(token, "SELL", amount);

        if (buyPreview) {
            refs.buyPreviewAmount.textContent = `${formatCompact(buyPreview.amountRlo)} RLO -> ${formatCompact(buyPreview.amountToken)} ${symbol}`;
            refs.buyPreviewImpact.textContent = `Impact ${formatPercent(buyPreview.priceImpact)}`;
        } else {
            refs.buyPreviewAmount.textContent = "Pool cannot fill this BUY size";
            refs.buyPreviewImpact.textContent = "Impact -";
        }

        if (sellPreview) {
            refs.sellPreviewAmount.textContent = `${formatCompact(sellPreview.amountToken)} ${symbol} -> ${formatCompact(sellPreview.amountRlo)} RLO`;
            refs.sellPreviewImpact.textContent = `Impact ${formatPercent(sellPreview.priceImpact)}`;
        } else {
            refs.sellPreviewAmount.textContent = `Pool cannot fill this SELL size`;
            refs.sellPreviewImpact.textContent = "Impact -";
        }

        if (!activePreview) {
            refs.previewMinReceived.textContent = "Pool cannot fill this order";
            refs.previewExecutionPrice.textContent = "-";
            refs.previewSlippage.textContent = `${(Number(state.slippageBps || 0) / 100).toFixed(1)}%`;
            return;
        }

        const slippageRate = getSelectedSlippageRate();
        const minimumReceived = mode === "buy"
            ? Number((activePreview.amountToken * (1 - slippageRate)).toFixed(6))
            : Number((activePreview.amountRlo * (1 - slippageRate)).toFixed(6));

        refs.previewMinReceived.textContent = mode === "buy"
            ? `${formatCompact(minimumReceived)} ${symbol}`
            : `${formatCompact(minimumReceived)} RLO`;
        refs.previewExecutionPrice.textContent = `${formatPrice(activePreview.executionPrice)} / ${mode === "buy" ? symbol : "RLO"}`;
        refs.previewSlippage.textContent = `${(Number(state.slippageBps || 0) / 100).toFixed(1)}%`;
    }

    function refreshChartHeadline() {
        const visibleCandles = getDisplayCandles(state.activeTokenCandles || []);

        if (!visibleCandles.length) {
            refs.chartPriceNow.textContent = formatTokenChartPrice(0);
            refs.chartPriceChange.textContent = "0.00%";
            refs.chartPriceChange.classList.remove("positive", "negative");
            return;
        }

        const firstCandle = visibleCandles[0];
        const lastCandle = visibleCandles[visibleCandles.length - 1];
        const startPrice = Number(firstCandle.open || firstCandle.close || 0);
        const endPrice = Number(lastCandle.close || 0);
        const change = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;

        refs.chartPriceNow.textContent = formatTokenChartPrice(endPrice);
        refs.chartPriceChange.textContent = formatPercent(change);
        refs.chartPriceChange.classList.toggle("positive", change > 0);
        refs.chartPriceChange.classList.toggle("negative", change < 0);

        return {
            endPrice,
            change
        };
    }

    function getCurrentViewerRloBalance() {
        if (Number.isFinite(Number(state.chainRloBalance))) {
            return Number(state.chainRloBalance || 0);
        }

        return Number(state.activeToken?.viewer?.rloBalance || 0);
    }

    function getCurrentViewerTokenBalance() {
        return Number(state.activeToken?.viewer?.tokenBalance || 0);
    }

    function updateTradeActionAvailability() {
        const hasViewer = Boolean(state.activeToken?.viewer);
        const rloBalance = getCurrentViewerRloBalance();
        const tokenBalance = getCurrentViewerTokenBalance();
        const mode = getActiveTradeMode();

        refs.buyBtn.disabled = hasViewer && rloBalance <= 0;
        refs.sellBtn.disabled = hasViewer && tokenBalance <= 0;
        refs.buyBtn.classList.toggle("is-primary", mode === "buy");
        refs.sellBtn.classList.toggle("is-primary", mode === "sell");
        refs.buyBtn.title = refs.buyBtn.disabled ? "You need RLO in your wallet to buy." : "Buy with RLO";
        refs.sellBtn.title = refs.sellBtn.disabled ? `You need ${refs.tradeSymbol.textContent || "token"} in your wallet to sell.` : "Sell your tokens";
        syncTradeModeUi();
        refreshTradePreview();
    }

    function getFriendlyTradeError(error, side, tokenSymbol) {
        const raw = [error?.shortMessage, error?.reason, error?.message]
            .filter(Boolean)
            .join(" ");

        if (/too many errors|could not coalesce error|unknown_error|rpc endpoint returned too many errors/i.test(raw)) {
            return "Rialo Testnet RPC is busy right now. Wait a few seconds, then try again.";
        }

        if (/rejected|denied|cancelled|canceled/i.test(raw)) {
            return "Wallet confirmation was rejected.";
        }

        if (/insufficient funds/i.test(raw)) {
            return "You do not have enough RLO in your wallet for this trade.";
        }

        if (/missing revert data|CALL_EXCEPTION|execution reverted|revert/i.test(raw)) {
            if (/slippage exceeded/i.test(raw)) {
                return "The market moved beyond your slippage setting before the transaction confirmed.";
            }

            if (/deadline passed/i.test(raw)) {
                return "The trade expired before it could confirm. Try again.";
            }

            return side === "SELL"
                ? `You do not have enough ${tokenSymbol} to sell this amount.`
                : "The BUY transaction could not be completed on-chain.";
        }

        return error?.message || "The trade could not be completed.";
    }

    function normalizeDecimalValue(value) {
        const raw = String(value ?? "").trim().replace(/,/g, ".");
        const cleaned = raw.replace(/[^0-9.]/g, "");
        const firstDot = cleaned.indexOf(".");

        if (firstDot === -1) {
            return cleaned;
        }

        return `${cleaned.slice(0, firstDot + 1)}${cleaned.slice(firstDot + 1).replace(/\./g, "")}`;
    }

    function parseDecimalInput(input) {
        return Number(normalizeDecimalValue(input?.value || "") || 0);
    }

    function setupDecimalInput(input) {
        if (!input) {
            return;
        }

        input.setAttribute("inputmode", "decimal");

        input.addEventListener("input", () => {
            const normalized = normalizeDecimalValue(input.value);

            if (input.value !== normalized) {
                input.value = normalized;
            }
        });

        input.addEventListener("blur", () => {
            input.value = normalizeDecimalValue(input.value);
        });
    }

    async function loadMarketChainRloBalance(address = connectedWalletAddress) {
        if (!address || !window.ethereum || typeof ethers === "undefined") {
            state.chainRloBalance = null;
            return null;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balanceWei = await provider.getBalance(address);
            const balanceRlo = Number(ethers.formatEther(balanceWei));
            state.chainRloBalance = Number(balanceRlo.toFixed(6));
            return state.chainRloBalance;
        } catch {
            state.chainRloBalance = null;
            return null;
        }
    }

    async function getMarketFactoryArtifact() {
        if (!state.factoryArtifactPromise) {
            state.factoryArtifactPromise = fetch(RIALO_MARKET_FACTORY_ARTIFACT_URL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Factory artifact is not available.");
                    }

                    return response.json();
                });
        }

        return state.factoryArtifactPromise;
    }

    function getStoredFactoryAddress() {
        try {
            return localStorage.getItem(RIALO_MARKET_FACTORY_STORAGE_KEY) || "";
        } catch {
            return "";
        }
    }

    function setStoredFactoryAddress(address) {
        try {
            if (address) {
                localStorage.setItem(RIALO_MARKET_FACTORY_STORAGE_KEY, address);
            } else {
                localStorage.removeItem(RIALO_MARKET_FACTORY_STORAGE_KEY);
            }
        } catch {
            // Ignore storage failures.
        }
    }

    async function getMarketFactoryContract(target, forcedAddress = "") {
        if (!window.ethereum || typeof ethers === "undefined") {
            return null;
        }

        const artifact = await getMarketFactoryArtifact();
        const factoryAddress = forcedAddress || getStoredFactoryAddress();

        if (!factoryAddress) {
            return null;
        }

        const provider = target && typeof target.getAddress === "function"
            ? target.provider
            : target;

        if (!provider || typeof provider.getCode !== "function") {
            return null;
        }

        if (factoryAddress !== state.validatedFactoryAddress) {
            const code = await provider.getCode(factoryAddress);
            if (!code || code === "0x") {
                setStoredFactoryAddress("");
                state.validatedFactoryAddress = "";
                return null;
            }

            state.validatedFactoryAddress = factoryAddress;
        }

        return new ethers.Contract(factoryAddress, artifact.abi, target);
    }

    async function ensureOnChainMarketFactory(signer) {
        let contract = await getMarketFactoryContract(signer);
        if (contract) {
            return contract;
        }

        const artifact = await getMarketFactoryArtifact();
        refs.status.textContent = "Deploying the Rialo market factory on-chain...";

        const factoryBuilder = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
        contract = await factoryBuilder.deploy();
        await contract.waitForDeployment();

        const deployedAddress = await contract.getAddress();
        setStoredFactoryAddress(deployedAddress);
        state.validatedFactoryAddress = deployedAddress;
        return contract;
    }

    function parseTokenCreatedFromReceipt(receipt, abi) {
        const contractInterface = new ethers.Interface(abi);

        for (const log of receipt.logs || []) {
            try {
                const parsed = contractInterface.parseLog(log);
                if (parsed && parsed.name === "TokenCreated") {
                    return {
                        tokenAddress: parsed.args.token,
                        creatorAddress: parsed.args.creator,
                        supply: parsed.args.totalSupply || parsed.args.supply
                    };
                }
            } catch {
                // Ignore unrelated logs.
            }
        }

        return null;
    }

    function parseTradeExecutedFromReceipt(receipt, abi) {
        const contractInterface = new ethers.Interface(abi);

        for (const log of receipt.logs || []) {
            try {
                const parsed = contractInterface.parseLog(log);
                if (parsed && parsed.name === "TradeExecuted") {
                    return {
                        trader: parsed.args.trader,
                        token: parsed.args.token,
                        isBuy: Boolean(parsed.args.isBuy),
                        amountRlo: Number(ethers.formatEther(parsed.args.amountRlo)),
                        amountToken: Number(ethers.formatEther(parsed.args.amountToken)),
                        executionPrice: Number(ethers.formatEther(parsed.args.executionPrice)),
                        actualRloReserve: Number(ethers.formatEther(parsed.args.actualRloReserve)),
                        virtualRloReserve: Number(ethers.formatEther(parsed.args.virtualRloReserve)),
                        virtualTokenReserve: Number(ethers.formatEther(parsed.args.virtualTokenReserve))
                    };
                }
            } catch {
                // Ignore unrelated logs.
            }
        }

        return null;
    }

    async function loadOnChainTokenBalance(tokenAddress, holderAddress = connectedWalletAddress) {
        if (!tokenAddress || !holderAddress || !window.ethereum || typeof ethers === "undefined") {
            return null;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const tokenContract = new ethers.Contract(tokenAddress, ERC20_MINIMAL_ABI, provider);
            const balance = await tokenContract.balanceOf(holderAddress);
            return Number(ethers.formatEther(balance));
        } catch {
            return null;
        }
    }

    async function hydrateOnChainViewerBalances(token, options = {}) {
        if (!token || !token.tokenAddress || !connectedWalletAddress) {
            return token;
        }

        const force = Boolean(options.force);

        if (!force && token.viewer && Number.isFinite(Number(token.viewer.rloBalance)) && Number.isFinite(Number(token.viewer.tokenBalance))) {
            return token;
        }

        const [rloBalance, tokenBalance] = await Promise.all([
            loadMarketChainRloBalance(connectedWalletAddress),
            loadOnChainTokenBalance(token.tokenAddress, connectedWalletAddress)
        ]);

        token.viewer = {
            address: connectedWalletAddress,
            rloBalance: rloBalance ?? 0,
            tokenBalance: tokenBalance ?? Number(token.viewer?.tokenBalance || 0)
        };

        return token;
    }

    async function ensureMarketWalletSession() {
        if (!window.ethereum) {
            throw new Error("MetaMask is not installed.");
        }

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (!accounts || !accounts.length) {
            throw new Error("No wallet account found.");
        }

        const switched = await ensureRialoTestnetForTransaction();
        if (!switched) {
            throw new Error("Switch to Rialo Testnet first.");
        }

        connectedWalletAddress = accounts[0];
        walletConnected = true;

        if (!getSavedTwitterUsername()) {
            if (typeof showTwitterUsernameBox === "function") {
                showTwitterUsernameBox(connectedWalletAddress);
            }
            throw new Error("Enter and confirm your X username first.");
        }

        if (typeof setWalletUiAfterMint === "function") {
            setWalletUiAfterMint(connectedWalletAddress);
        }

        await loadMarketChainRloBalance(connectedWalletAddress);

        return connectedWalletAddress;
    }

    function encodeWalletMessage(message) {
        if (typeof ethers !== "undefined" && ethers.hexlify && ethers.toUtf8Bytes) {
            return ethers.hexlify(ethers.toUtf8Bytes(message));
        }

        return message;
    }

    async function confirmMarketWalletAction(action, lines) {
        const address = await ensureMarketWalletSession();
        const message = [
            "Rialo Market Confirmation",
            `Action: ${action}`,
            ...lines,
            `Wallet: ${address}`,
            `Time: ${new Date().toISOString()}`,
            "This signature confirms your intent inside Rialo Market."
        ].join("\n");

        try {
            const signature = await window.ethereum.request({
                method: "personal_sign",
                params: [encodeWalletMessage(message), address]
            });

            return {
                address,
                message,
                signature
            };
        } catch (error) {
            if (error && error.code === 4001) {
                throw new Error("Wallet confirmation was rejected.");
            }

            throw new Error("Wallet confirmation failed.");
        }
    }

    async function apiFetch(url, options = {}) {
        const response = await fetch(getApiUrl(url), {
            headers: {
                "Content-Type": "application/json"
            },
            ...options
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || "Request failed.");
        }

        return data;
    }

    function showMarketError(error) {
        const message = location.protocol === "file:"
            ? "Open Rialo PM through its server URL instead of opening index.html directly."
            : (error.message || "Failed to load market data.");

        refs.grid.innerHTML = `
            <div class="market-feed-row">
                <strong>Market unavailable</strong>
                <span>${escapeHTML(message)}</span>
            </div>
        `;
    }

    async function loadTokens() {
        const data = await apiFetch(`/api/tokens?sort=${encodeURIComponent(state.filter)}`);
        state.tokens = Array.isArray(data.tokens) ? data.tokens : [];
        renderTrendingStrip();
        renderMarketGrid();
    }

    async function loadPortfolio() {
        const params = new URLSearchParams();

        if (connectedWalletAddress) {
            params.set("viewer", connectedWalletAddress);
        }

        if (state.chainRloBalance !== null) {
            params.set("viewerBalanceRlo", String(state.chainRloBalance));
        }

        const query = params.toString() ? `?${params.toString()}` : "";
        const data = await apiFetch(`/api/portfolio${query}`);
        state.portfolio = data.portfolio || null;
        renderPortfolio();
    }

    async function loadTokenDetail(tokenId, keepScroll = false, options = {}) {
        const params = new URLSearchParams();
        const hydrateChain = options.hydrateChain !== false;

        if (connectedWalletAddress) {
            params.set("viewer", connectedWalletAddress);
        }

        if (state.chainRloBalance !== null) {
            params.set("viewerBalanceRlo", String(state.chainRloBalance));
        }

        const viewerQuery = params.toString() ? `?${params.toString()}` : "";
        const data = await apiFetch(`/api/tokens/${encodeURIComponent(tokenId)}${viewerQuery}`);
        if (data.token?.factoryAddress) {
            setStoredFactoryAddress(data.token.factoryAddress);
        }
        if (hydrateChain) {
            await hydrateOnChainViewerBalances(data.token, { force: true });
        }
        state.activeTokenId = tokenId;
        fillTokenScreen(data.token, data.candles || []);
        refs.defaultView.hidden = true;
        refs.tokenScreen.hidden = false;

        if (!keepScroll) {
            requestAnimationFrame(() => {
                refs.tokenScreen.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
    }

    function renderPortfolio() {
        const portfolio = state.portfolio;

        if (!portfolio || !portfolio.viewerAddress) {
            refs.portfolioSyncNote.textContent = "Wallet view";
            refs.portfolioTotalValue.textContent = "-";
            refs.portfolioWalletRlo.textContent = connectedWalletAddress && state.chainRloBalance !== null
                ? `${formatCompact(state.chainRloBalance)} RLO`
                : "Pool not ready";
            refs.portfolioTokenValue.textContent = "-";
            refs.portfolioPositionCount.textContent = "0";
            refs.portfolioPnl.textContent = "-";
            refs.portfolioPnlRow.classList.remove("positive", "negative");
            refs.portfolioHoldings.innerHTML = `
                <div class="market-portfolio-empty">
                    <strong>Connect your wallet</strong>
                    <span>We will show your live RLO balance, token positions, and personal market footprint here.</span>
                </div>
            `;
            return;
        }

        refs.portfolioSyncNote.textContent = `${shortWallet(portfolio.viewerAddress)} live wallet`;
        refs.portfolioTotalValue.textContent = `${formatCompact(portfolio.totalPortfolioValueRlo)} RLO`;
        refs.portfolioWalletRlo.textContent = `${formatCompact(portfolio.walletRloBalance)} RLO`;
        refs.portfolioTokenValue.textContent = `${formatCompact(portfolio.totalTokenValueRlo)} RLO`;
        refs.portfolioPositionCount.textContent = String(Number(portfolio.positionsCount || 0));
        refs.portfolioPnl.textContent = formatSignedRlo(portfolio.unrealizedPnlRlo || 0);
        refs.portfolioPnlRow.classList.toggle("positive", Number(portfolio.unrealizedPnlRlo || 0) > 0);
        refs.portfolioPnlRow.classList.toggle("negative", Number(portfolio.unrealizedPnlRlo || 0) < 0);

        const positions = Array.isArray(portfolio.positions) ? portfolio.positions : [];
        if (!positions.length) {
            refs.portfolioHoldings.innerHTML = `
                <div class="market-portfolio-empty">
                    <strong>No token positions yet</strong>
                    <span>Your launched coins and purchased meme positions will appear here as soon as you hold them.</span>
                </div>
            `;
            return;
        }

        refs.portfolioHoldings.innerHTML = positions.slice(0, 6).map(position => `
            <button class="market-portfolio-position" type="button" data-portfolio-token="${escapeHTML(position.tokenId)}">
                <div class="market-portfolio-position-top">
                    <div class="market-portfolio-position-token">
                        <div class="market-portfolio-position-image">
                            ${position.imageUrl ? `<img src="${escapeHTML(position.imageUrl)}" alt="${escapeHTML(position.name)} meme image" loading="lazy">` : ""}
                        </div>
                        <div class="market-portfolio-position-labels">
                            <strong>${escapeHTML(position.name)}</strong>
                            <span>${escapeHTML(position.symbol)} · ${escapeHTML(formatCompact(position.balance))}</span>
                        </div>
                    </div>
                    <div class="market-portfolio-position-value">
                        <strong>${escapeHTML(formatCompact(position.valueRlo))} RLO</strong>
                        <span>${escapeHTML(formatPrice(position.priceRlo))}</span>
                    </div>
                </div>
                <div class="market-portfolio-position-meta">
                    <span>
                        Avg Entry
                        <strong>${escapeHTML(formatPrice(position.averageEntryRlo || 0))}</strong>
                    </span>
                    <span>
                        PnL
                        <strong class="${Number(position.unrealizedPnlRlo || 0) >= 0 ? "market-pnl-positive" : "market-pnl-negative"}">${escapeHTML(formatSignedRlo(position.unrealizedPnlRlo || 0))}</strong>
                    </span>
                </div>
            </button>
        `).join("");

        refs.portfolioHoldings.querySelectorAll("[data-portfolio-token]").forEach(button => {
            button.addEventListener("click", () => {
                loadTokenDetail(button.dataset.portfolioToken || "").catch(showMarketError);
            });
        });
    }

    function buildChart(candles) {
        const visibleCandles = getDisplayCandles(candles);

        if (!visibleCandles.length) {
            refs.chartVisual.innerHTML = `
                <div class="market-feed-row">
                    <strong>No chart data yet</strong>
                    <span>Waiting for trades</span>
                </div>
            `;
            return;
        }

        const zoom = Number(state.chartZoom || 1);
        const width = Math.max(1280, Math.round(1280 * zoom));
        const height = 520;
        const padding = { top: 22, right: 176, bottom: 58, left: 24 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const allHighs = visibleCandles.map(candle => Number(candle.high || candle.close || 0));
        const allLows = visibleCandles.map(candle => Number(candle.low || candle.close || 0));
        const rawMin = Math.min(...allLows);
        const rawMax = Math.max(...allHighs);
        const rangeBase = Math.max(rawMax - rawMin, rawMax * 0.02, 0.0001);
        const minPrice = Math.max(0, rawMin - rangeBase * 0.18);
        const maxPrice = rawMax + rangeBase * 0.18;
        const priceRange = Math.max(maxPrice - minPrice, 0.0001);
        const preferredSlot = Math.max(8, 11 * zoom);
        const usedWidth = Math.min(chartWidth, Math.max(visibleCandles.length * preferredSlot, Math.min(chartWidth * 0.82, visibleCandles.length * 12 * zoom)));
        const startX = Math.max(padding.left, width - padding.right - usedWidth);
        const slotWidth = usedWidth / Math.max(visibleCandles.length, 1);
        const candleWidth = Math.max(3, Math.min(8, slotWidth * 0.55));

        const yForPrice = price => {
            const normalized = (Number(price || 0) - minPrice) / priceRange;
            return padding.top + (1 - normalized) * chartHeight;
        };

        const horizontalGrid = Array.from({ length: 5 }, (_, index) => {
            const ratio = index / 4;
            const price = maxPrice - ratio * priceRange;
            const y = padding.top + ratio * chartHeight;

            return `
                <line class="market-chart-grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line>
                <text class="market-chart-axis-text" x="${width - 34}" y="${y + 4}" text-anchor="end">${escapeHTML(formatChartNumber(price))}</text>
            `;
        }).join("");

        const showDateOnXAxis = chartSpansMultipleDays(visibleCandles);

        const timeLabelCandidates = [
            0,
            Math.max(0, Math.floor((visibleCandles.length - 1) * 0.33)),
            Math.max(0, Math.floor((visibleCandles.length - 1) * 0.66)),
            visibleCandles.length - 1
        ];
        const timeLabelPoints = [];
        const usedTimeLabels = new Set();
        const minTimeLabelGap = 132;

        [...new Set(timeLabelCandidates)].reverse().forEach(index => {
            const candle = visibleCandles[index];
            if (!candle) return;

            const x = startX + slotWidth * index + slotWidth / 2;
            const labelX = Math.max(padding.left + 58, Math.min(width - padding.right - 58, x));
            const timeLabel = formatChartTimeLabel(candle.timestamp, { includeDate: showDateOnXAxis });

            if (!timeLabel || usedTimeLabels.has(timeLabel)) return;
            if (timeLabelPoints.some(point => Math.abs(point.x - labelX) < minTimeLabelGap)) return;

            usedTimeLabels.add(timeLabel);
            timeLabelPoints.push({ index, x: labelX, label: timeLabel });
        });

        const timeLabelMap = new Map(timeLabelPoints.map(point => [point.index, point]));

        const verticalGrid = visibleCandles.map((candle, index) => {
            const x = startX + slotWidth * index + slotWidth / 2;
            const labelPoint = timeLabelMap.get(index);

            return `
                <line class="market-chart-grid-line vertical" x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}"></line>
                ${labelPoint ? `<text class="market-chart-time-text" x="${labelPoint.x}" y="${height - 16}" text-anchor="middle">${escapeHTML(labelPoint.label)}</text>` : ""}
            `;
        }).join("");

        const candleSvg = visibleCandles.map((candle, index) => {
            const x = startX + slotWidth * index + slotWidth / 2;
            const yOpen = yForPrice(candle.open);
            const yClose = yForPrice(candle.close);
            const yHigh = yForPrice(candle.high);
            const yLow = yForPrice(candle.low);
            const bodyY = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1.2);
            const bodyX = x - candleWidth / 2;
            const directionClass = candle.direction === "down" ? "down" : "up";
            const lastClass = index === visibleCandles.length - 1 ? " is-last" : "";
            const label = `${formatChartNumber(candle.open)} / ${formatChartNumber(candle.high)} / ${formatChartNumber(candle.low)} / ${formatChartNumber(candle.close)}`;

            return `
                <g class="market-candle ${directionClass}${lastClass}" aria-label="${escapeHTML(label)}">
                    <line class="market-candle-wick" x1="${x}" y1="${yHigh}" x2="${x}" y2="${yLow}"></line>
                    <rect class="market-candle-body" x="${bodyX}" y="${bodyY}" width="${candleWidth}" height="${bodyHeight}" rx="0.8"></rect>
                </g>
            `;
        }).join("");

        const lastCandle = visibleCandles[visibleCandles.length - 1];
        const currentPrice = Number(lastCandle.close || 0);
        const currentY = yForPrice(currentPrice);

        refs.chartVisual.innerHTML = `
            <div class="market-candle-chart-shell">
                <svg class="market-candle-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Candlestick chart">
                    <rect class="market-chart-bg" x="0" y="0" width="${width}" height="${height}" rx="18"></rect>
                    <rect class="market-chart-axis-panel" x="${width - padding.right}" y="0" width="${padding.right}" height="${height}" rx="18"></rect>
                    <line class="market-chart-axis-border" x1="${width - padding.right}" y1="${padding.top}" x2="${width - padding.right}" y2="${height - padding.bottom}"></line>
                    ${horizontalGrid}
                    ${verticalGrid}
                    <line class="market-price-line" x1="${padding.left}" y1="${currentY}" x2="${width - padding.right}" y2="${currentY}"></line>
                    <text class="market-price-tag" x="${width - 34}" y="${Math.max(padding.top + 14, Math.min(height - padding.bottom - 8, currentY - 7))}" text-anchor="end">${escapeHTML(formatChartNumber(currentPrice))}</text>
                    ${candleSvg}
                </svg>
            </div>
        `;

        requestAnimationFrame(() => {
            refs.chartVisual.scrollLeft = refs.chartVisual.scrollWidth;
        });
    }

    function renderTradeFeed(token) {
        if (!token.recentTrades.length) {
            refs.tradeFeed.innerHTML = `
                <div class="market-feed-row">
                    <strong>No trades yet</strong>
                    <span>Waiting for activity</span>
                </div>
            `;
            return;
        }

        refs.tradeFeed.innerHTML = token.recentTrades.map(trade => `
            <div class="market-feed-row market-feed-row-trade ${trade.side === "SELL" ? "sell" : "buy"}">
                <div class="market-feed-main">
                    <strong>${escapeHTML(trade.side)}</strong>
                    <span>${escapeHTML(
                        trade.side === "SELL"
                            ? `${formatCompact(trade.amountToken || 0)} ${token.symbol} -> ${formatCompact(trade.amountRlo || 0)} RLO`
                            : `${formatCompact(trade.amountRlo || 0)} RLO -> ${formatCompact(trade.amountToken || 0)} ${token.symbol}`
                    )}</span>
                </div>
                <div class="market-feed-meta">
                    <span>${escapeHTML(formatPrice(trade.executionPrice || trade.price || 0))}${trade.traderAddress ? ` - ${escapeHTML(shortWallet(trade.traderAddress))}` : ""}</span>
                    <span>${escapeHTML(trade.time)}</span>
                    ${trade.txHash && getExplorerBaseUrl()
                        ? `<a class="market-feed-link" href="${escapeHTML(`${getExplorerBaseUrl()}/tx/${trade.txHash}`)}" target="_blank" rel="noopener noreferrer">View Tx</a>`
                        : ""}
                </div>
            </div>
        `).join("");
    }

    function renderMyTrades(token) {
        const viewerAddress = String(token?.viewer?.address || "").toLowerCase();
        const viewerTrades = Array.isArray(token?.viewerTrades) ? token.viewerTrades : [];

        refs.myTradesNote.textContent = viewerAddress ? `${shortWallet(viewerAddress)} activity` : "Wallet view";

        if (!viewerAddress) {
            refs.myTradesFeed.innerHTML = `
                <div class="market-feed-row">
                    <strong>Connect wallet</strong>
                    <span>Connect your wallet to see your personal trades for this token.</span>
                </div>
            `;
            return;
        }

        if (!viewerTrades.length) {
            refs.myTradesFeed.innerHTML = `
                <div class="market-feed-row">
                    <strong>No personal trades yet</strong>
                    <span>Your confirmed buys and sells will appear here.</span>
                </div>
            `;
            return;
        }

        refs.myTradesFeed.innerHTML = viewerTrades.map(trade => `
            <div class="market-feed-row market-feed-row-trade ${trade.side === "SELL" ? "sell" : "buy"}">
                <div class="market-feed-main">
                    <strong>${escapeHTML(trade.side)}</strong>
                    <span>${escapeHTML(
                        trade.side === "SELL"
                            ? `${formatCompact(trade.amountToken || 0)} ${token.symbol} -> ${formatCompact(trade.amountRlo || 0)} RLO`
                            : `${formatCompact(trade.amountRlo || 0)} RLO -> ${formatCompact(trade.amountToken || 0)} ${token.symbol}`
                    )}</span>
                </div>
                <div class="market-feed-meta">
                    <span>${escapeHTML(formatPrice(trade.executionPrice || trade.price || 0))}</span>
                    <span>${escapeHTML(trade.time || "Just now")}</span>
                    ${trade.txHash && getExplorerBaseUrl()
                        ? `<a class="market-feed-link" href="${escapeHTML(`${getExplorerBaseUrl()}/tx/${trade.txHash}`)}" target="_blank" rel="noopener noreferrer">Tx</a>`
                        : ""}
                </div>
            </div>
        `).join("");
    }

    function renderTrendingStrip() {
        const latest = [...state.tokens]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 8);

        if (!latest.length) {
            refs.strip.innerHTML = `
                <div class="market-trending-chip">
                    <span>RLO</span>
                    <strong>COMMUNITY</strong>
                    <small>Waiting for the first launch</small>
                </div>
            `;
            return;
        }

        refs.strip.innerHTML = latest.map(token => `
            <div class="market-trending-chip">
                <span>LISTED</span>
                <strong>${escapeHTML(token.symbol)}</strong>
                <small>${escapeHTML(formatPrice(token.price))}</small>
            </div>
        `).join("");
    }

    function renderMarketGrid() {
        if (!state.tokens.length) {
            refs.grid.innerHTML = `
                <div class="market-feed-row">
                    <strong>No community tokens listed yet</strong>
                    <span>Launch the first token and it will become the first live RLO market in this section.</span>
                </div>
            `;
            return;
        }

        refs.grid.innerHTML = state.tokens.map(token => `
            <article class="market-token-card">
                <div class="market-token-media">
                    ${token.imageUrl ? `<img class="market-token-cover" src="${escapeHTML(token.imageUrl)}" alt="${escapeHTML(token.name)} meme image" loading="lazy">` : ""}
                    <div class="market-token-badge">$${escapeHTML(token.symbol)}</div>
                </div>

                <div class="market-token-body">
                    <strong>${escapeHTML(token.name)}</strong>
                    <p>${escapeHTML(token.description)}</p>

                    <div class="market-token-stats">
                        <div class="market-token-stat">
                            <span>Price</span>
                            <strong>${escapeHTML(formatPrice(token.price))}</strong>
                        </div>

                        <div class="market-token-stat">
                            <span>MCap</span>
                            <strong>${escapeHTML(formatCompact(token.mcap))}</strong>
                        </div>

                        <div class="market-token-stat">
                            <span>Volume</span>
                            <strong>${escapeHTML(formatCompact(token.volume))}</strong>
                        </div>
                    </div>

                    <button class="market-open-token-btn" type="button" data-open-token="${escapeHTML(token.id)}">
                        Open Token
                    </button>
                </div>
            </article>
        `).join("");

        refs.grid.querySelectorAll("[data-open-token]").forEach(button => {
            button.addEventListener("click", () => {
                loadTokenDetail(button.dataset.openToken || "").catch(showMarketError);
            });
        });
    }

    function fillTokenScreen(token, candles) {
        const previousToken = state.activeToken;
        const previousLatestTrade = previousToken && Array.isArray(previousToken.tradeHistory) && previousToken.tradeHistory.length
            ? previousToken.tradeHistory[previousToken.tradeHistory.length - 1].timestamp
            : "";
        const nextLatestTrade = Array.isArray(token.tradeHistory) && token.tradeHistory.length
            ? token.tradeHistory[token.tradeHistory.length - 1].timestamp
            : "";

        state.activeToken = token;
        state.activeTokenCandles = Array.isArray(candles) ? candles : [];
        const hasImage = Boolean(token.imageUrl);
        refs.detailOrb.classList.toggle("has-image", hasImage);
        refs.detailOrb.classList.toggle("is-hidden", !hasImage);
        refs.detailOrb.innerHTML = hasImage
            ? `<img src="${escapeHTML(token.imageUrl)}" alt="${escapeHTML(token.name)} meme image">`
            : "";
        refs.detailHero.classList.toggle("is-hidden", !hasImage);
        refs.detailHeroImage.src = hasImage ? token.imageUrl : "";
        refs.detailHeroImage.alt = hasImage ? `${token.name} meme image` : "Token meme image";
        refs.detailSymbol.textContent = `$${token.symbol}`;
        refs.detailName.textContent = token.name;
        refs.detailDescription.textContent = token.description;
        refs.detailPrice.textContent = formatPrice(token.price);
        refs.detailMcap.textContent = `${formatCompact(token.mcap, 2)} RLO`;
        refs.detailVolume.textContent = `${formatCompact(token.volume, 4)} RLO`;
        refs.detailHolders.textContent = formatCompact(token.holders);
        refs.detailSupply.textContent = formatCompact(token.supply, 2);
        refs.detailWebsite.textContent = token.website && token.website !== "None" ? token.website : "None";
        refs.detailLiquidity.textContent = `${formatCompact(token.pool?.rloReserve || 0, 4)} RLO`;
        refs.detailPoolToken.textContent = `${formatCompact(token.pool?.tokenReserve || 0, 2)} ${token.symbol}`;
        refs.detailFee.textContent = `${Number(token.pool?.feeBps || 0) / 100}%`;
        refs.detailContract.textContent = token.tokenAddress ? shortWallet(token.tokenAddress) : "Pending";
        refs.detailCreator.textContent = token.creatorAddress ? shortWallet(token.creatorAddress) : "Wallet";
        refs.chartLabel.textContent = `${token.symbol} Activity`;
        refs.tradeSymbol.textContent = token.symbol;
        refs.tradeAmount.placeholder = `Buy: amount in RLO | Sell: amount in ${token.symbol}`;

        const explorerBaseUrl = getExplorerBaseUrl();
        setMarketLink(
            refs.detailContractLink,
            token.tokenAddress && explorerBaseUrl ? `${explorerBaseUrl}/address/${token.tokenAddress}` : "",
            token.tokenAddress ? `Contract ${shortWallet(token.tokenAddress)}` : "Contract Pending"
        );
        setMarketLink(
            refs.detailLaunchLink,
            token.creationTxHash && explorerBaseUrl ? `${explorerBaseUrl}/tx/${token.creationTxHash}` : "",
            token.creationTxHash ? "Launch Transaction" : "Launch Tx Pending"
        );
        setMarketLink(
            refs.detailCreatorLink,
            token.creatorAddress && explorerBaseUrl ? `${explorerBaseUrl}/address/${token.creatorAddress}` : "",
            token.creatorAddress ? `Creator ${shortWallet(token.creatorAddress)}` : "Creator Wallet"
        );

        if (token.viewer) {
            const displayedRloBalance = Number.isFinite(Number(state.chainRloBalance))
                ? Number(state.chainRloBalance || 0)
                : Number(token.viewer.rloBalance || 0);

            refs.walletRloBalance.textContent = `${formatCompact(displayedRloBalance, 4)} RLO`;
            refs.walletTokenBalance.textContent = `${formatCompact(token.viewer.tokenBalance, 4)} ${token.symbol}`;
            refs.walletBalanceNote.textContent = `Wallet ${shortWallet(token.viewer.address)} is synced from your connected wallet and shown here as RLO.`;
        } else {
            refs.walletRloBalance.textContent = "-";
            refs.walletTokenBalance.textContent = "-";
            refs.walletBalanceNote.textContent = "Connect wallet to load your market balances.";
        }

        buildChart(candles);
        const chartMeta = refreshChartHeadline();
        renderTradeFeed(token);
        renderMyTrades(token);
        state.lastTradeTxHash = Array.isArray(token.viewerTrades) && token.viewerTrades[0]?.txHash
            ? token.viewerTrades[0].txHash
            : "";
        setLastTradeLink(state.lastTradeTxHash, state.lastTradeTxHash ? "View latest confirmed tx" : "Awaiting trade confirmation");
        updateTradeActionAvailability();
        syncTradeModeUi();

        if (previousToken && previousToken.id === token.id) {
            pulseValueChange(refs.detailPrice, previousToken.price, token.price);
            pulseValueChange(refs.detailMcap, previousToken.mcap, token.mcap);
            pulseValueChange(refs.detailVolume, previousToken.volume, token.volume);
            pulseValueChange(refs.detailHolders, previousToken.holders, token.holders);
            pulseValueChange(refs.chartPriceNow, previousToken.price, chartMeta.endPrice);
            pulseValueChange(refs.chartPriceChange, 0, chartMeta.change);

            if (previousToken.viewer && token.viewer) {
                pulseValueChange(
                    refs.walletRloBalance,
                    previousToken.viewer.rloBalance,
                    Number.isFinite(Number(state.chainRloBalance)) ? Number(state.chainRloBalance || 0) : token.viewer.rloBalance
                );
                pulseValueChange(refs.walletTokenBalance, previousToken.viewer.tokenBalance, token.viewer.tokenBalance);
                pulseValueChange(
                    refs.walletRloBalance.closest(".market-wallet-balance-box"),
                    previousToken.viewer.rloBalance,
                    Number.isFinite(Number(state.chainRloBalance)) ? Number(state.chainRloBalance || 0) : token.viewer.rloBalance
                );
                pulseValueChange(refs.walletTokenBalance.closest(".market-wallet-balance-box"), previousToken.viewer.tokenBalance, token.viewer.tokenBalance);
            }

            if (previousLatestTrade && nextLatestTrade && previousLatestTrade !== nextLatestTrade) {
                pulseElement(refs.chartCard);
                pulseElement(refs.feedCard);
                pulseElement(refs.chartVisual);
                updateLiveStatus("New trade landed");
            } else {
                updateLiveStatus("Live market synced");
            }
        } else {
            updateLiveStatus("Live market");
        }
    }

    function resetMarketView() {
        state.activeTokenId = null;
        state.activeToken = null;
        refs.tokenScreen.hidden = true;
        refs.defaultView.hidden = false;
        refs.modal.hidden = true;
        refs.tradeAmount.value = "";
        refs.tradeAmount.placeholder = "Buy: RLO amount | Sell: token amount";
        refs.detailOrb.classList.remove("has-image");
        refs.detailOrb.innerHTML = "";
        refs.detailOrb.classList.add("is-hidden");
        refs.detailHero.classList.add("is-hidden");
        refs.detailHeroImage.removeAttribute("src");
        refs.walletRloBalance.textContent = "-";
        refs.walletTokenBalance.textContent = "-";
        refs.walletBalanceNote.textContent = "Connect wallet to load your market balances.";
        refs.chartPriceNow.textContent = formatTokenChartPrice(0);
        refs.chartPriceChange.textContent = "0.00%";
        refs.chartPriceChange.classList.remove("positive", "negative");
        refs.chartLiveStatus.textContent = "Live market";
        refs.detailLiquidity.textContent = "0 RLO";
        refs.detailPoolToken.textContent = "0 TOKEN";
        refs.detailFee.textContent = "0%";
        refs.detailContract.textContent = "Pending";
        refs.detailCreator.textContent = "Wallet";
        setMarketLink(refs.detailContractLink, "", "View Contract");
        setMarketLink(refs.detailLaunchLink, "", "Launch Tx");
        setMarketLink(refs.detailCreatorLink, "", "Creator Wallet");
        refs.tradeStatus.textContent = "Market trades will update the price, market cap, volume, and chart in real time.";
        refs.myTradesNote.textContent = "Wallet view";
        refs.myTradesFeed.innerHTML = `
            <div class="market-feed-row">
                <strong>No token selected</strong>
                <span>Open a token to see your personal trading activity.</span>
            </div>
        `;
        state.lastTradeTxHash = "";
        setLastTradeLink("", "Awaiting trade confirmation");
        state.activeTokenCandles = [];
        updateTradeActionAvailability();
    }

    function applyQuickTradeAmount(mode, value = "") {
        const tokenSymbol = refs.tradeSymbol.textContent || "TOKEN";
        const walletRloBalance = getCurrentViewerRloBalance();
        const walletTokenBalance = getCurrentViewerTokenBalance();
        let nextValue = "";

        if (mode === "buy-max") {
            nextValue = walletRloBalance > 0 ? String(Number(walletRloBalance.toFixed(6))) : "";
        } else if (mode === "buy") {
            nextValue = String(Number(value || 0));
        } else if (mode === "sell") {
            const ratio = Number(value || 0);
            nextValue = walletTokenBalance > 0 ? String(Number((walletTokenBalance * ratio).toFixed(6))) : "";
        }

        refs.tradeAmount.value = nextValue;
        setTradeMode(mode === "sell" ? "sell" : "buy");
        refs.tradeAmount.placeholder = mode === "sell"
            ? `Sell: amount in ${tokenSymbol}`
            : "Buy: amount in RLO";
        refreshTradePreview();
    }

    function openCreateModal() {
        refs.modal.hidden = false;
        document.body.classList.add("market-create-open");
        refs.name.focus();
        if (refs.price) refs.price.value = refs.price.value || "0.01";
        refs.status.textContent = "Create Token will deploy a real ERC-20 on-chain, then list it inside Rialo Market with RLO liquidity.";
        setCreateImagePreview(state.pendingCreateImage);
    }

    function closeCreateModal() {
        refs.modal.hidden = true;
        document.body.classList.remove("market-create-open");
        refs.form.reset();
        if (refs.price) refs.price.value = "0.01";
        if (refs.seedLiquidity) refs.seedLiquidity.value = "0.05";
        resetCreateImageState();
    }

    async function createToken(event) {
        event.preventDefault();

        const payload = {
            name: refs.name.value.trim(),
            symbol: refs.symbol.value.trim().toUpperCase(),
            price: parseDecimalInput(refs.price) || 0.01,
            seedLiquidityRlo: parseDecimalInput(refs.seedLiquidity) || 0.05,
            supply: Number(refs.supply.value || 0),
            imageUrl: state.pendingCreateImage,
            description: refs.description.value.trim(),
            website: refs.website.value.trim() || "None"
        };

        if (!payload.name || !payload.symbol || !payload.description || payload.price <= 0 || payload.seedLiquidityRlo <= 0 || payload.supply <= 0) {
            refs.status.textContent = "Complete the token name, symbol, description, and supply first.";
            return;
        }

        refs.status.textContent = "Connecting wallet...";

        try {
            const walletAddress = await ensureMarketWalletSession();
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const factoryArtifact = await getMarketFactoryArtifact();
            const factory = await ensureOnChainMarketFactory(signer);
            const onChainSupply = ethers.parseUnits(String(Math.round(payload.supply)), 18);
            const initialPriceWad = ethers.parseUnits(String(payload.price), 18);
            const seedLiquidityWei = ethers.parseEther(RIALO_REAL_NATIVE_TX_VALUE);

            refs.status.textContent = "Confirm the on-chain token creation in your wallet...";

            const tx = await factory.createToken(
                payload.name,
                payload.symbol,
                onChainSupply,
                initialPriceWad,
                { value: seedLiquidityWei }
            );
            refs.status.textContent = "Waiting for on-chain confirmation...";

            const receipt = await tx.wait();
            const parsedEvent = parseTokenCreatedFromReceipt(receipt, factoryArtifact.abi);
            const factoryAddress = await factory.getAddress();

            if (!parsedEvent || !parsedEvent.tokenAddress) {
                throw new Error("Token was deployed, but its address could not be read from the chain.");
            }

            await loadMarketChainRloBalance(walletAddress);

            const data = await apiFetch("/api/tokens", {
                method: "POST",
                body: JSON.stringify({
                    ...payload,
                    creatorAddress: walletAddress,
                    walletRloBalance: state.chainRloBalance,
                    creatorSignature: tx.hash,
                    signedMessage: "CREATE_TOKEN_ONCHAIN",
                    tokenAddress: parsedEvent.tokenAddress,
                    factoryAddress,
                    creationTxHash: receipt.hash || tx.hash,
                    onChainSupply: onChainSupply.toString()
                })
            });

            refs.status.textContent = `Token created on-chain: ${shortWallet(parsedEvent.tokenAddress)}.`;
            state.filter = "latest";

            document.querySelectorAll("[data-market-filter]").forEach(button => {
                button.classList.toggle("active", (button.dataset.marketFilter || "") === "latest");
            });

            await loadTokens();
            await loadPortfolio();
            closeCreateModal();
            await loadTokenDetail(data.token.id);
        } catch (error) {
            refs.status.textContent = error.message;
        }
    }

    async function submitTrade(side) {
        if (!state.activeTokenId) {
            refs.tradeStatus.textContent = "Open a token first.";
            return;
        }

        if (!state.activeToken || !state.activeToken.tokenAddress) {
            refs.tradeStatus.textContent = "This token is not wired to an on-chain market yet.";
            return;
        }

        const amount = parseDecimalInput(refs.tradeAmount);

        if (!amount || amount <= 0) {
            refs.tradeStatus.textContent = "Enter a valid amount first.";
            return;
        }

        const protectivePreview = estimateTradeOutput(state.activeToken, side, amount);
        if (!protectivePreview) {
            refs.tradeStatus.textContent = side === "BUY"
                ? "This BUY size is too large for the current pool."
                : "This SELL size is too large for the current pool.";
            return;
        }

        const slippageRate = getSelectedSlippageRate();
        const deadline = Math.floor(Date.now() / 1000) + (15 * 60);
        const minTokenOut = (protectivePreview.amountToken * (1 - slippageRate)).toFixed(18);
        const minRloOut = (protectivePreview.amountRlo * (1 - slippageRate)).toFixed(18);

        refs.tradeStatus.textContent = "Waiting for wallet confirmation...";

        try {
            const tokenSymbol = refs.tradeSymbol.textContent || "TOKEN";
            const tokenAddress = state.activeToken.tokenAddress;
            const walletAddress = await ensureMarketWalletSession();
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const factoryArtifact = await getMarketFactoryArtifact();
            const factory = await getMarketFactoryContract(signer, state.activeToken.factoryAddress || getStoredFactoryAddress());
            const preTradeRloBalance = state.chainRloBalance ?? await loadMarketChainRloBalance(walletAddress);
            const preTradeTokenBalance = side === "SELL"
                ? await loadOnChainTokenBalance(tokenAddress, walletAddress)
                : null;
            const viewerTokenBalance = preTradeTokenBalance ?? getCurrentViewerTokenBalance();
            const viewerRloBalance = preTradeRloBalance ?? getCurrentViewerRloBalance();

            if (!factory) {
                throw new Error("On-chain market factory was not found for this token.");
            }

            if (side === "BUY" && viewerRloBalance < Number(RIALO_REAL_NATIVE_TX_VALUE)) {
                throw new Error("You need a small Rialo Testnet balance to confirm this BUY.");
            }

            if (side === "SELL" && viewerTokenBalance <= 0) {
                throw new Error(`You do not have any ${tokenSymbol} available to sell on-chain.`);
            }

            let receipt;
            let tradeEvent;

            if (side === "BUY") {
                refs.tradeStatus.textContent = `Confirm the BUY transaction in your wallet. Protected by ${(slippageRate * 100).toFixed(1)}% slippage...`;
                const tx = await factory.buyToken(
                    tokenAddress,
                    0n,
                    deadline,
                    {
                    value: ethers.parseEther(RIALO_REAL_NATIVE_TX_VALUE)
                    }
                );

                refs.tradeStatus.textContent = "Waiting for on-chain confirmation...";
                receipt = await tx.wait();
                tradeEvent = parseTradeExecutedFromReceipt(receipt, factoryArtifact.abi);
            } else {
                const tokenContract = new ethers.Contract(tokenAddress, ERC20_MINIMAL_ABI, signer);
                const chainSellAmount = Math.min(amount, Math.max(Number(viewerTokenBalance || 0), 0));
                const sellAmountUnits = ethers.parseUnits(String(Math.max(chainSellAmount, 0).toFixed(18)), 18);
                const currentAllowance = await tokenContract.allowance(walletAddress, await factory.getAddress());

                if (currentAllowance < sellAmountUnits) {
                    refs.tradeStatus.textContent = "Approve the token in your wallet first...";
                    const approveTx = await tokenContract.approve(await factory.getAddress(), sellAmountUnits);
                    await approveTx.wait();
                }

                refs.tradeStatus.textContent = `Confirm the SELL transaction in your wallet. Protected by ${(slippageRate * 100).toFixed(1)}% slippage...`;
                const tx = await factory.sellToken(
                    tokenAddress,
                    sellAmountUnits,
                    0n,
                    deadline
                );
                refs.tradeStatus.textContent = "Waiting for on-chain confirmation...";
                receipt = await tx.wait();
                tradeEvent = parseTradeExecutedFromReceipt(receipt, factoryArtifact.abi);
            }

            if (!tradeEvent) {
                throw new Error("Trade was confirmed on-chain, but the trade event could not be parsed.");
            }

            const displayTrade = side === "BUY"
                ? {
                    amountRlo: Number(amount.toFixed(6)),
                    amountToken: Number(protectivePreview.amountToken.toFixed(6)),
                    executionPrice: protectivePreview.amountToken > 0 ? Number((amount / protectivePreview.amountToken).toFixed(8)) : tradeEvent.executionPrice
                }
                : {
                    amountRlo: Number(protectivePreview.amountRlo.toFixed(6)),
                    amountToken: Number(amount.toFixed(6)),
                    executionPrice: amount > 0 ? Number((protectivePreview.amountRlo / amount).toFixed(8)) : tradeEvent.executionPrice
                };

            const data = await apiFetch(`/api/tokens/${encodeURIComponent(state.activeTokenId)}/trades`, {
                method: "POST",
                body: JSON.stringify({
                    side,
                    amountRlo: displayTrade.amountRlo,
                    amountToken: displayTrade.amountToken,
                    executionPrice: displayTrade.executionPrice,
                    traderAddress: walletAddress,
                    walletRloBalance: preTradeRloBalance,
                    txHash: receipt.hash || "",
                    traderSignature: receipt.hash || "",
                    signedMessage: side === "BUY" ? "BUY_ONCHAIN" : "SELL_ONCHAIN"
                })
            });

            await loadMarketChainRloBalance(walletAddress);
            refs.tradeAmount.value = "";
            state.lastTradeTxHash = receipt.hash || "";
            setLastTradeLink(state.lastTradeTxHash, "View confirmed trade");
            refs.tradeStatus.textContent = side === "BUY"
                ? `BUY executed on-chain: ${formatCompact(displayTrade.amountRlo)} RLO -> ${formatCompact(displayTrade.amountToken)} ${tokenSymbol}.`
                : `SELL executed on-chain: ${formatCompact(displayTrade.amountToken)} ${tokenSymbol} -> ${formatCompact(displayTrade.amountRlo)} RLO.`;
            await loadTokens();
            await loadPortfolio();
            await hydrateOnChainViewerBalances(data.token, { force: true });
            fillTokenScreen(data.token, data.candles || []);
        } catch (error) {
            refs.tradeStatus.textContent = getFriendlyTradeError(error, side, refs.tradeSymbol.textContent || "TOKEN");
        }
    }

    async function refreshActiveTokenSilently() {
        if (!state.activeTokenId || refs.tokenScreen.hidden) {
            return;
        }

        try {
            await loadTokenDetail(state.activeTokenId, true, { hydrateChain: false });
        } catch {
            // Keep the current market screen unchanged on polling failure.
        }
    }

    function startPolling() {
        if (state.pollingHandle) {
            clearInterval(state.pollingHandle);
        }

        state.pollingHandle = setInterval(async () => {
            try {
                await loadTokens();
                await refreshActiveTokenSilently();
                await loadPortfolio();
                if (!state.activeTokenId) {
                    updateLiveStatus("Scanning live market");
                }
            } catch {
                // Ignore transient polling errors.
            }
        }, 4000);
    }

    window.refreshRialoMarketUi = async () => {
        try {
            if (connectedWalletAddress) {
                await loadMarketChainRloBalance(connectedWalletAddress);
            } else {
                state.chainRloBalance = null;
            }
            await loadTokens();
            await loadPortfolio();
            await refreshActiveTokenSilently();
        } catch {
            // Ignore refresh errors triggered by wallet/network changes.
        }
    };

    refs.openMain.addEventListener("click", openCreateModal);
    refs.openSide.addEventListener("click", openCreateModal);
    refs.closeModal.addEventListener("click", closeCreateModal);
    refs.backBtn.addEventListener("click", resetMarketView);
    refs.tradeModeBuy.addEventListener("click", () => setTradeMode("buy"));
    refs.tradeModeSell.addEventListener("click", () => setTradeMode("sell"));
    refs.chartZoomOut.addEventListener("click", () => changeChartZoom(-1));
    refs.chartZoomIn.addEventListener("click", () => changeChartZoom(1));
    refs.chartZoomReadout.addEventListener("click", () => {
        state.chartZoom = 1;
        updateChartZoomReadout();

        if (state.activeToken) {
            buildChart(state.activeTokenCandles || []);
        }
    });
    document.querySelectorAll("[data-market-timeframe]").forEach(button => {
        button.addEventListener("click", () => {
            setChartTimeframe(button.dataset.marketTimeframe || "1m");
        });
    });
    document.querySelectorAll("[data-market-quick]").forEach(button => {
        button.addEventListener("click", () => {
            applyQuickTradeAmount(button.dataset.marketQuick || "", button.dataset.value || "");
        });
    });
    document.querySelectorAll("[data-market-slippage]").forEach(button => {
        button.addEventListener("click", () => {
            state.slippageBps = Math.max(0, Number(button.dataset.marketSlippage || 100));
            syncSlippageButtons();
            refreshTradePreview();
        });
    });
    setupDecimalInput(refs.price);
    setupDecimalInput(refs.seedLiquidity);
    setupDecimalInput(refs.tradeAmount);
    updateChartZoomReadout();
    syncChartTimeframeButtons();
    syncSlippageButtons();
    syncTradeModeUi();
    refreshTradePreview();
    refs.tradeAmount.addEventListener("input", refreshTradePreview);

    if (refs.imageInput) {
        refs.imageInput.addEventListener("change", async event => {
            const file = event.target.files && event.target.files[0];

            if (!file) {
                resetCreateImageState();
                return;
            }

            if (!/^image\/(png|jpeg|jpg|webp|gif)$/i.test(file.type)) {
                refs.status.textContent = "Use PNG, JPG, WEBP, or GIF for the meme image.";
                resetCreateImageState();
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                refs.status.textContent = "Keep the meme image under 2 MB.";
                resetCreateImageState();
                return;
            }

            try {
                const dataUrl = await readFileAsDataUrl(file);
                state.pendingCreateImage = dataUrl;
                setCreateImagePreview(dataUrl, file.name);
                refs.status.textContent = "Meme image ready. Continue launching your token.";
            } catch (error) {
                refs.status.textContent = error.message;
                resetCreateImageState();
            }
        });
    }

    refs.modal.addEventListener("click", event => {
        if (event.target === refs.modal) {
            closeCreateModal();
        }
    });

    refs.form.addEventListener("submit", createToken);

    document.querySelectorAll("[data-market-filter]").forEach(button => {
        button.addEventListener("click", () => {
            state.filter = button.dataset.marketFilter || "latest";

            document.querySelectorAll("[data-market-filter]").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            loadTokens().catch(showMarketError);
        });
    });

    refs.buyBtn.addEventListener("click", () => {
        setTradeMode("buy");
        submitTrade("BUY");
    });
    refs.sellBtn.addEventListener("click", () => {
        setTradeMode("sell");
        submitTrade("SELL");
    });

    window.resetRialoMarketView = resetMarketView;

    Promise.all([loadTokens(), loadPortfolio()])
        .then(startPolling)
        .catch(showMarketError);
}
function keepConfirmTextEnglish() {
    const confirmBtn = document.getElementById("twitter-confirm-btn");
    if (!confirmBtn) return;

    function normalize() {
        if (confirmBtn.textContent.trim() === "Confirmer") {
            confirmBtn.textContent = "Confirm";
        }
    }

    normalize();

    const observer = new MutationObserver(normalize);
    observer.observe(confirmBtn, {
        childList: true,
        characterData: true,
        subtree: true
    });
}

function init() {
    if (rialoAppInitialized) return;
    rialoAppInitialized = true;

    initGroupOrders();

    initMouseGlow();
    queueExpandedNftCollectionRender();
    refreshNftUiState().catch(error => {
        console.warn("Initial NFT UI refresh skipped:", error);
    });
    setupTabs();
    setupHowPanel();
    setupWallet();
    setupAiAssistant();
    setupSubmit();
    setupFinalClick();
    setupEntryOdds();
    setupRialoWorldCupNftPage();
    setupRialoSwapUi();
    setupRialoMarketUi();
    keepConfirmTextEnglish();
    renderGroups();
    resetBracket();
    updateProgressUI();
    renderPredictionHistory();

    setTimeout(drawConnectors, 80);
    window.addEventListener("resize", drawConnectors);
}

function initGroupOrders() {
    worldCupGroups.forEach(group => {
        groupOrders[group.id] = group.teams.map(team => [...team]);
    });
}

function initMouseGlow() {
    const oldGlow = document.getElementById("mouse-glow");

    if (oldGlow) {
        oldGlow.style.display = "none";
        oldGlow.style.opacity = "0";
        oldGlow.style.visibility = "hidden";
        oldGlow.style.pointerEvents = "none";
    }

    const oldStyle = document.getElementById("rialo-cursor-glow-style");
    if (oldStyle) oldStyle.remove();

    const style = document.createElement("style");
    style.id = "rialo-cursor-glow-style";
    style.textContent = `
        .mouse-glow {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }

        #rialo-cursor-glow {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 160px !important;
            height: 160px !important;
            pointer-events: none !important;
            z-index: 2147483647 !important;
            opacity: 0 !important;
            border-radius: 999px !important;
            background: radial-gradient(circle, rgba(0, 255, 132, 0.40) 0%, rgba(0, 255, 132, 0.22) 22%, rgba(0, 255, 132, 0.10) 46%, rgba(0, 255, 132, 0.035) 62%, transparent 74%) !important;
            filter: blur(8px) saturate(1.25) !important;
            mix-blend-mode: normal !important;
            transition: opacity 0.16s ease !important;
            will-change: transform, opacity !important;
        }

        #rialo-cursor-glow.active {
            opacity: 0.68 !important;
        }

        #rialo-cursor-glow .rialo-cursor-dot {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            width: 7px !important;
            height: 7px !important;
            transform: translate(-50%, -50%) !important;
            border-radius: 50% !important;
            background: #00ff84 !important;
            box-shadow: 0 0 10px rgba(0, 255, 132, 0.95), 0 0 22px rgba(0, 255, 132, 0.55), 0 0 42px rgba(0, 255, 132, 0.30) !important;
        }
    `;
    document.head.appendChild(style);

    const existingGlow = document.getElementById("rialo-cursor-glow");
    if (existingGlow) existingGlow.remove();

    const glow = document.createElement("div");
    glow.id = "rialo-cursor-glow";
    glow.innerHTML = `<span class="rialo-cursor-dot"></span>`;
    document.body.appendChild(glow);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    document.addEventListener("mousemove", event => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        glow.classList.add("active");
    });

    document.addEventListener("mouseenter", () => glow.classList.add("active"));
    document.addEventListener("mouseleave", () => glow.classList.remove("active"));

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.22;
        glowY += (mouseY - glowY) * 0.22;
        glow.style.transform = `translate3d(${glowX - 80}px, ${glowY - 80}px, 0)`;
        requestAnimationFrame(animateGlow);
    }

    animateGlow();
}

function queueExpandedNftCollectionRender() {
    setTimeout(renderExpandedNftCollection, 0);
    window.addEventListener("load", renderExpandedNftCollection, { once: true });

    if (nftRefreshHookReady) return;
    nftRefreshHookReady = true;

    const nftPageBtn = document.getElementById("nft-page-btn");
    if (nftPageBtn) {
        nftPageBtn.addEventListener("click", () => {
            setTimeout(renderExpandedNftCollection, 0);
        });
    }
}

function setupNftViewTabs() {
    const collectionBtn = document.getElementById("nft-tab-collection");
    const marketBtn = document.getElementById("nft-tab-market");
    const itemsBtn = document.getElementById("nft-tab-items");
    const collectionPanel = document.getElementById("nft-panel-collection");
    const marketPanel = document.getElementById("nft-panel-market");
    const itemsPanel = document.getElementById("nft-panel-items");

    if (!collectionBtn || !marketBtn || !itemsBtn || !collectionPanel || !marketPanel || !itemsPanel || collectionBtn.dataset.ready === "1") {
        return;
    }

    function applyMode(mode) {
        nftViewMode = ["collection", "market", "items"].includes(mode) ? mode : "collection";
        collectionBtn.classList.toggle("active", nftViewMode === "collection");
        marketBtn.classList.toggle("active", nftViewMode === "market");
        itemsBtn.classList.toggle("active", nftViewMode === "items");
        collectionPanel.classList.toggle("active", nftViewMode === "collection");
        marketPanel.classList.toggle("active", nftViewMode === "market");
        itemsPanel.classList.toggle("active", nftViewMode === "items");
    }

    collectionBtn.dataset.ready = "1";
    collectionBtn.addEventListener("click", () => applyMode("collection"));
    marketBtn.addEventListener("click", () => applyMode("market"));
    itemsBtn.addEventListener("click", () => applyMode("items"));
    applyMode(nftViewMode);
}

function openNftListingModal(code) {
    const card = getNftCardByCode(code);
    const tokenId = getNftTokenIdByCode(code);
        const priceInput = document.getElementById("nft-listing-price");
        const amountInput = document.getElementById("nft-listing-amount");
        const status = document.getElementById("nft-listing-status");
    const subtitle = document.getElementById("nft-listing-subtitle");
    const modal = document.getElementById("nft-listing-modal");
    const existingListing = getCurrentWalletNftListing(code);
    const ownedBalance = getNftOwnedBalanceByCode(code);

    if (!card || !tokenId || !priceInput || !amountInput || !status || !subtitle || !modal) {
        return;
    }

    nftUiState.listingCode = code;
    nftUiState.listingTokenId = tokenId;
    priceInput.value = existingListing ? String(existingListing.priceRlo) : String(card.priceRlo || 0);
    amountInput.value = existingListing ? String(existingListing.amount || 1) : String(Math.min(1, Math.max(ownedBalance, 1)));
    subtitle.textContent = `List ${card.captain} (${card.country}) for resale inside Rialo PM.`;
    status.textContent = existingListing
        ? `Your current listing is ${existingListing.priceRlo} RLO. Update it here or cancel it from the card.`
        : `Set your resale price in RLO, then list up to ${ownedBalance} NFT item(s) for everyone to see.`;
    modal.hidden = false;
    document.body.classList.add("market-create-open");
    priceInput.focus();
    priceInput.select();
}

function closeNftListingModal() {
    const modal = document.getElementById("nft-listing-modal");
    const status = document.getElementById("nft-listing-status");
    const priceInput = document.getElementById("nft-listing-price");
    const amountInput = document.getElementById("nft-listing-amount");

    nftUiState.listingCode = "";
    nftUiState.listingTokenId = 0;

    if (modal) {
        modal.hidden = true;
    }

    if (status) {
        status.textContent = "Set the RLO price you want for this NFT, then list it in the collection.";
    }

    if (priceInput) {
        priceInput.value = "";
    }

    if (amountInput) {
        amountInput.value = "";
    }

    document.body.classList.remove("market-create-open");
}

async function submitNftListing() {
    const code = nftUiState.listingCode;
    const tokenId = nftUiState.listingTokenId;
    const priceInput = document.getElementById("nft-listing-price");
    const amountInput = document.getElementById("nft-listing-amount");
    const status = document.getElementById("nft-listing-status");

    if (!code || !tokenId || !priceInput || !amountInput || !status) {
        return;
    }

    if (!connectedWalletAddress) {
        status.textContent = "Connect your wallet first before listing an NFT.";
        return;
    }

    const priceText = String(priceInput.value || "").trim().replace(",", ".");
    const priceRlo = Number(priceText);
    const amount = Math.max(1, Math.floor(Number(String(amountInput.value || "").replace(/[^\d]/g, ""))));

    if (!Number.isFinite(priceRlo) || priceRlo <= 0) {
        status.textContent = "Enter a valid resale price in RLO.";
        return;
    }

    const ownedBalance = getNftOwnedBalanceByCode(code);
    if (ownedBalance <= 0) {
        status.textContent = "You need to own this NFT before you can list it.";
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > ownedBalance) {
        status.textContent = `Enter a valid amount between 1 and ${ownedBalance}.`;
        return;
    }

    if (!window.ethereum || typeof ethers === "undefined") {
        status.textContent = "Wallet tools are not available.";
        return;
    }

    status.textContent = "Preparing on-chain NFT listing...";

    try {
        const switched = await ensureRialoTestnetForTransaction();
        if (!switched) {
            status.textContent = "Switch to Rialo Testnet first.";
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
        const marketplace = await ensureOnChainNftMarketplace(signer);
        const marketplaceAddress = await marketplace.getAddress();

        const approved = await nftContract.isApprovedForAll(signerAddress, marketplaceAddress);
        if (!approved) {
            status.textContent = "Approving the NFT marketplace in your wallet...";
            const approveTx = await nftContract.setApprovalForAll(marketplaceAddress, true);
            await approveTx.wait();
        }

        status.textContent = "Confirm the NFT listing in your wallet...";
        const pricePerUnitWei = ethers.parseEther(String(priceRlo));
        const listTx = await marketplace.list(tokenId, amount, pricePerUnitWei);
        const receipt = await listTx.wait();

        const data = await apiFetchJson("/api/nft-listings", {
            method: "POST",
            body: JSON.stringify({
                code,
                tokenId,
                sellerAddress: signerAddress,
                amount,
                priceRlo,
                txHash: receipt?.hash || listTx.hash || ""
            })
        });

        setNftListings(data.listings || []);
        status.textContent = `Listed successfully at ${priceRlo} RLO for ${amount} item(s).`;
        await refreshNftUiState();
        setTimeout(closeNftListingModal, 650);
    } catch (error) {
        const raw = [error?.shortMessage, error?.reason, error?.message].filter(Boolean).join(" ");
        if (/approve marketplace/i.test(raw)) {
            status.textContent = "Approve the NFT marketplace first, then try listing again.";
            return;
        }
        if (/insufficient nft/i.test(raw)) {
            status.textContent = "You do not have enough NFT items for this listing amount.";
            return;
        }
        if (/missing revert data|CALL_EXCEPTION|execution reverted/i.test(raw)) {
            status.textContent = "The NFT listing transaction could not be completed on-chain.";
            return;
        }
        status.textContent = error.message || "Failed to save the listing.";
    }
}

async function cancelNftListing(code) {
    if (!connectedWalletAddress) {
        alert("Connect your wallet first.");
        return;
    }

    const currentListing = getCurrentWalletNftListing(code);
    const currentListedAmount = Math.max(0, Math.floor(Number(currentListing?.amount || 0)));
    if (!currentListing || currentListedAmount <= 0) {
        alert("No active listing was found for this NFT.");
        return;
    }

    const defaultCancelAmount = String(currentListedAmount);
    const cancelAmountText = window.prompt(`How many listed NFT item(s) do you want to cancel? (1-${currentListedAmount})`, defaultCancelAmount);
    if (cancelAmountText === null) {
        return;
    }

    const cancelAmount = Math.max(0, Math.floor(Number(String(cancelAmountText || "").replace(/[^\d]/g, ""))));
    if (!Number.isFinite(cancelAmount) || cancelAmount <= 0 || cancelAmount > currentListedAmount) {
        alert(`Enter a valid cancel amount between 1 and ${currentListedAmount}.`);
        return;
    }

    try {
        const switched = await ensureRialoTestnetForTransaction();
        if (!switched) {
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const marketplace = await ensureOnChainNftMarketplace(signer);
        const tokenId = getNftTokenIdByCode(code);
        const cancelTx = await marketplace.cancel(tokenId, cancelAmount);
        const receipt = await cancelTx.wait();

        const data = await apiFetchJson("/api/nft-listings/cancel", {
            method: "POST",
            body: JSON.stringify({
                code,
                sellerAddress: signerAddress,
                amount: cancelAmount,
                txHash: receipt?.hash || cancelTx.hash || ""
            })
        });

        setNftListings(data.listings || []);
        await refreshNftUiState();
    } catch (error) {
        const raw = [error?.shortMessage, error?.reason, error?.message].filter(Boolean).join(" ");
        if (/listing not active/i.test(raw)) {
            alert("This NFT listing is no longer active.");
            return;
        }
        if (/missing revert data|CALL_EXCEPTION|execution reverted/i.test(raw)) {
            try {
                const data = await apiFetchJson("/api/nft-listings/cancel", {
                    method: "POST",
                    body: JSON.stringify({
                        code,
                        sellerAddress: connectedWalletAddress,
                        amount: cancelAmount,
                        txHash: ""
                    })
                });

                setNftListings(data.listings || []);
                await refreshNftUiState();
                alert("The old local listing was removed. You can list this NFT again to create a real on-chain listing.");
                return;
            } catch {
                // Fall through to the generic alert below.
            }
        }
        alert(error.message || "Failed to cancel the listing.");
    }
}

async function buyListedNft(code, sellerAddress = "") {
    if (!connectedWalletAddress) {
        alert("Connect your wallet first.");
        return;
    }

    const targetSeller = String(sellerAddress || "").toLowerCase();
    const listing = getNftListingsForCode(code).find(item => {
        if (!targetSeller) {
            return true;
        }

        return String(item.sellerAddress || "").toLowerCase() === targetSeller;
    }) || null;
    if (!listing) {
        alert("No active listing was found for this NFT.");
        return;
    }

    if (String(listing.sellerAddress || "").toLowerCase() === String(connectedWalletAddress || "").toLowerCase()) {
        alert("This is your own listing. Manage it from Items.");
        return;
    }

    try {
        const switched = await ensureRialoTestnetForTransaction();
        if (!switched) {
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const marketplace = await ensureOnChainNftMarketplace(signer);
        const totalPriceWei = ethers.parseEther(RIALO_REAL_NATIVE_TX_VALUE);
        const buyTx = await marketplace.buy(listing.sellerAddress, listing.tokenId, 1, {
            value: totalPriceWei
        });
        const receipt = await buyTx.wait();

        const data = await apiFetchJson("/api/nft-listings/purchase", {
            method: "POST",
            body: JSON.stringify({
                code,
                sellerAddress: listing.sellerAddress,
                amount: 1,
                txHash: receipt?.hash || buyTx.hash || ""
            })
        });

        setNftListings(data.listings || []);
        await refreshNftUiState();
    } catch (error) {
        const raw = [error?.shortMessage, error?.reason, error?.message].filter(Boolean).join(" ");
        if (/incorrect payment/i.test(raw)) {
            alert("The listed NFT price changed before your transaction was sent.");
            return;
        }
        if (/listing not active/i.test(raw)) {
            alert("This listed NFT is no longer available.");
            return;
        }
        alert(error.message || "Failed to buy the listed NFT.");
    }
}

function setupNftListingModal() {
    const modal = document.getElementById("nft-listing-modal");
    const submitBtn = document.getElementById("nft-listing-submit");
    const cancelBtn = document.getElementById("nft-listing-cancel");
    const priceInput = document.getElementById("nft-listing-price");
    const amountInput = document.getElementById("nft-listing-amount");

    if (!modal || !submitBtn || !cancelBtn || !priceInput || !amountInput || modal.dataset.ready === "1") {
        return;
    }

    modal.dataset.ready = "1";
    submitBtn.addEventListener("click", submitNftListing);
    cancelBtn.addEventListener("click", closeNftListingModal);
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeNftListingModal();
        }
    });
    priceInput.addEventListener("input", () => {
        priceInput.value = priceInput.value.replace(",", ".");
    });
    amountInput.addEventListener("input", () => {
        amountInput.value = amountInput.value.replace(/[^\d]/g, "");
    });
    priceInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            submitNftListing();
        }
    });
    amountInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            submitNftListing();
        }
    });
}

function renderExpandedNftCollection() {
    const grid = document.getElementById("nft-collection-grid");
    const itemsGrid = document.getElementById("nft-items-grid");
    const marketGrid = document.getElementById("nft-market-grid");
    const itemsNote = document.getElementById("nft-items-note");
    const marketNote = document.getElementById("nft-market-note");
    if (!grid || !itemsGrid || !marketGrid) return;

    const headerText = document.querySelector(".nft-stage-header p");
    if (headerText) {
        headerText.textContent = "Mint exclusive captain player cards with RLO. Collection is sorted from the highest RLO mint value to the lowest.";
    }

    setupNftListingModal();
    setupNftViewTabs();

    function renderCard(card, mode = "collection") {
        const ownedBalance = getNftOwnedBalanceByCode(card.code);
        const currentListing = getCurrentWalletNftListing(card.code);
        const currentWalletListedAmount = getCurrentWalletNftListedAmountByCode(card.code);
        const totalListedAmount = getTotalNftListedAmountByCode(card.code);
        const showSell = ownedBalance > 0;

        return `
        <article class="nft-player-card" data-code="${card.code}" data-price="${card.priceRlo}">
            <div class="nft-player-image">
                <img src="${card.image}" alt="${card.captain} NFT card" loading="lazy">
            </div>

            <div class="nft-player-info">
                <strong>${card.captain}</strong>
                <span>${card.country} Captain</span>
                ${ownedBalance > 0 ? `<span class="nft-owned-meta">Owned: ${ownedBalance}</span>` : ""}
                ${mode === "items" && currentWalletListedAmount > 0 ? `<span class="nft-listing-count">Listed: ${currentWalletListedAmount}</span>` : ""}
                <div class="nft-action-row">
                    ${mode === "collection" ? `
                        <button class="nft-mint-btn" type="button" data-code="${card.code}">
                            Mint 1 NFT - ${card.priceRlo} RLO
                        </button>
                    ` : ""}
                    ${mode === "items" && showSell
                        ? `<button class="nft-sell-btn" type="button" data-nft-sell="${card.code}">${currentListing ? `Update Sell - ${currentListing.priceRlo} RLO` : "Sell NFT"}</button>`
                        : ""}
                    ${mode === "items" && currentListing
                        ? `<button class="nft-cancel-listing-btn" type="button" data-nft-cancel="${card.code}">Cancel Listing</button>`
                        : ""}
                </div>
            </div>
        </article>
    `;
    }

    function renderListedCard(card, listing, unitIndex) {
        const isOwnListing = String(listing.sellerAddress || "").toLowerCase() === String(connectedWalletAddress || "").toLowerCase();

        return `
        <article class="nft-player-card nft-listed-card" data-code="${card.code}" data-price="${listing.priceRlo}">
            <div class="nft-player-image">
                <img src="${card.image}" alt="${card.captain} listed NFT card" loading="lazy">
            </div>

            <div class="nft-player-info">
                <strong>${card.captain}</strong>
                <span>${card.country} Captain</span>
                <span class="nft-market-seller">Seller: ${String(listing.sellerAddress || "").slice(0, 6)}...${String(listing.sellerAddress || "").slice(-4)}</span>
                <span class="nft-market-qty">Listed unit ${unitIndex}${Number(listing.amount || 0) > 1 ? ` of ${listing.amount}` : ""}</span>
                <div class="nft-action-row">
                    ${isOwnListing
                        ? `<button class="nft-listed-btn" type="button" disabled>Your listing - ${listing.priceRlo} RLO</button>`
                        : `<button class="nft-buy-listed-btn" type="button" data-nft-buy="${card.code}" data-nft-buy-seller="${listing.sellerAddress}">Buy - ${listing.priceRlo} RLO</button>`}
                </div>
            </div>
        </article>
        `;
    }

    const collectionMarkup = expandedRialoWorldCupNfts.map(card => renderCard(card, "collection"));
    grid.innerHTML = collectionMarkup.join("");

    const listedInventory = buildNftListedInventory();
    marketGrid.innerHTML = listedInventory.length
        ? listedInventory.map(({ card, listing, unitIndex }) => renderListedCard(card, listing, unitIndex)).join("")
        : "";
    if (marketNote) {
        marketNote.textContent = listedInventory.length
            ? `${listedInventory.length} listed NFT unit(s), sorted by highest RLO price.`
            : "No active NFT listings yet.";
    }

    const ownedCards = expandedRialoWorldCupNfts.filter(card => {
        return getNftOwnedBalanceByCode(card.code) > 0 || Boolean(getCurrentWalletNftListing(card.code));
    });
    if (itemsNote) {
        itemsNote.textContent = connectedWalletAddress
            ? (ownedCards.length ? `${connectedWalletAddress.slice(0, 6)}...${connectedWalletAddress.slice(-4)} · ${ownedCards.length} owned captain card type(s)` : "No NFTs owned yet on this wallet.")
            : "Connect wallet to load your NFT items.";
    }

    itemsGrid.innerHTML = ownedCards.length
        ? ownedCards.map(card => renderCard(card, "items")).join("")
        : `
            <div class="history-empty">
                ${connectedWalletAddress ? "No owned NFTs yet. Mint a captain card first, then manage it from Items." : "Connect wallet to see your NFT items."}
            </div>
        `;

    setupNftMintButtons();
    document.querySelectorAll("[data-nft-sell]").forEach(button => {
        button.addEventListener("click", () => {
            openNftListingModal(button.dataset.nftSell || "");
        });
    });
    document.querySelectorAll("[data-nft-cancel]").forEach(button => {
        button.addEventListener("click", () => {
            cancelNftListing(button.dataset.nftCancel || "");
        });
    });
    document.querySelectorAll("[data-nft-buy]").forEach(button => {
        button.addEventListener("click", () => {
            buyListedNft(button.dataset.nftBuy || "", button.dataset.nftBuySeller || "");
        });
    });
}

function setupTabs() {
    const groupsBtn = document.getElementById("groups-tab-btn");
    const bracketBtn = document.getElementById("bracket-tab-btn");
    const groupsView = document.getElementById("groups-view");
    const bracketView = document.getElementById("bracket-view");

    if (!groupsBtn || !bracketBtn || !groupsView || !bracketView) return;

    groupsBtn.addEventListener("click", () => {
        groupsBtn.classList.add("active");
        bracketBtn.classList.remove("active");
        groupsView.classList.add("active");
        bracketView.classList.remove("active");
    });

    bracketBtn.addEventListener("click", () => {
        if (!bracketGenerated) {
            alert("Complete all groups and generate the bracket first.");
            return;
        }

        bracketBtn.classList.add("active");
        groupsBtn.classList.remove("active");
        bracketView.classList.add("active");
        groupsView.classList.remove("active");
        setTimeout(drawConnectors, 80);
    });
}

function switchToBracketTab() {
    const groupsBtn = document.getElementById("groups-tab-btn");
    const bracketBtn = document.getElementById("bracket-tab-btn");
    const groupsView = document.getElementById("groups-view");
    const bracketView = document.getElementById("bracket-view");

    if (!groupsBtn || !bracketBtn || !groupsView || !bracketView) return;

    bracketBtn.classList.remove("locked");
    bracketBtn.classList.add("active");
    groupsBtn.classList.remove("active");
    bracketView.classList.add("active");
    groupsView.classList.remove("active");
    setTimeout(drawConnectors, 80);
}

function renderGroups() {
    const grid = document.getElementById("groups-grid");
    if (!grid) return;

    grid.innerHTML = worldCupGroups.map(group => {
        const teams = groupOrders[group.id];
        const isDone = completedGroups.has(group.id);

        return `
            <div class="group-card ${isDone ? "done" : ""}" data-group-id="${group.id}">
                <div class="group-card-head">
                    <div class="group-title">${group.name}</div>
                    <div class="group-state">${isDone ? "Locked" : "Open"}</div>
                </div>
                <div class="group-teams">
                    ${teams.map((team, index) => createGroupTeamMarkup(group.id, team, index, isDone)).join("")}
                </div>
                <button class="lock-group-btn" data-group-id="${group.id}">
                    ${isDone ? "Group Locked" : "Lock Group Ranking"}
                </button>
            </div>
        `;
    }).join("");

    setupGroupButtons();
}

function createGroupTeamMarkup(groupId, team, index, isDone) {
    const upDisabled = index === 0 || isDone ? "disabled" : "";
    const downDisabled = index === 3 || isDone ? "disabled" : "";
    const effectKey = `${groupId}-${team[0]}`;
    const moveEffect = groupMoveEffects[effectKey] || "";

    return `
        <div class="group-team ${moveEffect}">
            <div class="group-rank">${index + 1}</div>
            <img src="https://flagcdn.com/w40/${team[1]}.png" alt="${team[0]}">
            <div class="group-team-name">${team[0]}</div>
            <div class="group-move">
                <button type="button" aria-label="Move ${team[0]} up" title="Move up" data-action="up" data-group-id="${groupId}" data-index="${index}" ${upDisabled}>
                    <span class="group-move-icon" aria-hidden="true">&#9650;</span>
                </button>
                <button type="button" aria-label="Move ${team[0]} down" title="Move down" data-action="down" data-group-id="${groupId}" data-index="${index}" ${downDisabled}>
                    <span class="group-move-icon" aria-hidden="true">&#9660;</span>
                </button>
            </div>
        </div>
    `;
}

function setupGroupButtons() {
    document.querySelectorAll(".group-move button").forEach(button => {
        button.addEventListener("click", () => {
            const groupId = button.dataset.groupId;
            const index = Number(button.dataset.index);
            const action = button.dataset.action;

            if (!groupId || Number.isNaN(index)) return;
            if (completedGroups.has(groupId)) return;

            moveTeamInGroup(groupId, index, action);
        });
    });

    document.querySelectorAll(".lock-group-btn").forEach(button => {
        button.addEventListener("click", () => {
            const groupId = button.dataset.groupId;
            if (!groupId) return;

            if (completedGroups.has(groupId)) {
                completedGroups.delete(groupId);
            } else {
                completedGroups.add(groupId);
            }

            renderGroups();
            updateProgressUI();
        });
    });

    const generateBtn = document.getElementById("generate-bracket");
    if (generateBtn) {
        generateBtn.disabled = completedGroups.size < 12;
        generateBtn.onclick = generateBracketFromGroups;
    }
}

function moveTeamInGroup(groupId, index, action) {
    const teams = groupOrders[groupId];
    if (!teams) return;

    const targetIndex = action === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= teams.length) return;

    const movedTeam = teams[index];
    const swappedTeam = teams[targetIndex];
    const movedKey = `${groupId}-${movedTeam[0]}`;
    const swappedKey = `${groupId}-${swappedTeam[0]}`;

    delete groupMoveEffects[movedKey];
    delete groupMoveEffects[swappedKey];

    if (action === "up") {
        groupMoveEffects[movedKey] = "move-up-effect";
        groupMoveEffects[swappedKey] = "move-down-effect";
    } else {
        groupMoveEffects[movedKey] = "move-down-effect";
        groupMoveEffects[swappedKey] = "move-up-effect";
    }

    [teams[index], teams[targetIndex]] = [teams[targetIndex], teams[index]];
    renderGroups();

    setTimeout(() => {
        delete groupMoveEffects[movedKey];
        delete groupMoveEffects[swappedKey];
        renderGroups();
    }, 900);
}

function generateBracketFromGroups() {
    if (completedGroups.size < 12) {
        alert("Lock all 12 groups first.");
        return;
    }

    const bracketTeams = buildBracketTeamsFromGroups();
    if (bracketTeams.length !== 32) {
        alert("Bracket generation failed. Expected 32 teams.");
        return;
    }

    resetBracket();
    buildSide("L", bracketTeams.slice(0, 16));
    buildSide("R", bracketTeams.slice(16, 32));

    bracketGenerated = true;
    madePicks.clear();

    const mainBracket = document.getElementById("main-bracket");
    if (mainBracket) {
        mainBracket.classList.remove("bracket-locked");
        mainBracket.classList.add("bracket-ready");
    }

    switchToBracketTab();
    setupBracketClicks();
    updateProgressUI();
    setTimeout(drawConnectors, 100);
}

function buildBracketTeamsFromGroups() {
    const winners = [];
    const runnersUp = [];
    const thirds = [];

    worldCupGroups.forEach(group => {
        const order = groupOrders[group.id];
        winners.push(order[0]);
        runnersUp.push(order[1]);
        thirds.push(order[2]);
    });

    const bestThirds = thirds.slice(0, 8);

    return [
        winners[0], bestThirds[7],
        runnersUp[3], runnersUp[4],
        winners[7], bestThirds[0],
        runnersUp[1], runnersUp[10],
        winners[2], bestThirds[5],
        runnersUp[5], runnersUp[8],
        winners[9], bestThirds[2],
        runnersUp[7], runnersUp[11],
        winners[1], bestThirds[6],
        runnersUp[2], runnersUp[9],
        winners[4], bestThirds[3],
        runnersUp[0], runnersUp[6],
        winners[5], bestThirds[4],
        winners[3], bestThirds[1],
        winners[6], winners[10],
        winners[8], winners[11]
    ];
}

function resetBracket() {
    ["L1", "L2", "L3", "L4", "L5", "R1", "R2", "R3", "R4", "R5"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });

    const leftFinal = document.getElementById("final-left");
    const rightFinal = document.getElementById("final-right");
    const svg = document.getElementById("connector-layer");

    [leftFinal, rightFinal].forEach(finalSlot => {
        if (!finalSlot) return;
        finalSlot.textContent = "TBD";
        delete finalSlot.dataset.teamName;
        delete finalSlot.dataset.teamCode;
        finalSlot.classList.remove("selected", "loser", "advanced");
    });

    if (svg) svg.innerHTML = "";
}

function buildSide(prefix, teams) {
    const round1 = document.getElementById(`${prefix}1`);
    const round2 = document.getElementById(`${prefix}2`);
    const round3 = document.getElementById(`${prefix}3`);
    const round4 = document.getElementById(`${prefix}4`);
    const round5 = document.getElementById(`${prefix}5`);

    if (!round1 || !round2 || !round3 || !round4 || !round5) return;

    round1.innerHTML = "";
    round2.innerHTML = "";
    round3.innerHTML = "";
    round4.innerHTML = "";
    round5.innerHTML = "";

    for (let i = 0; i < teams.length; i += 2) {
        const matchIndex = i / 2;
        round1.innerHTML += createMatch({
            prefix,
            round: 1,
            match: matchIndex,
            slot1: createTeamSlot(teams[i], prefix, 1, matchIndex, 0),
            slot2: createTeamSlot(teams[i + 1], prefix, 1, matchIndex, 1)
        });
    }

    for (let i = 0; i < 4; i++) {
        round2.innerHTML += createMatch({ prefix, round: 2, match: i, slot1: createEmptySlot(), slot2: createEmptySlot() });
    }

    for (let i = 0; i < 2; i++) {
        round3.innerHTML += createMatch({ prefix, round: 3, match: i, slot1: createEmptySlot(), slot2: createEmptySlot() });
    }

    round4.innerHTML += createMatch({ prefix, round: 4, match: 0, slot1: createEmptySlot(), slot2: createEmptySlot() });
}

function createMatch({ prefix, round, match, slot1, slot2 }) {
    return `
        <div class="match" data-prefix="${prefix}" data-round="${round}" data-match="${match}">
            ${slot1}
            ${slot2}
        </div>
    `;
}

function createTeamSlot(team, prefix, round, match, slot) {
    return `
        <div
            class="team-slot"
            data-team-name="${team[0]}"
            data-team-code="${team[1]}"
            data-prefix="${prefix}"
            data-round="${round}"
            data-match="${match}"
            data-slot="${slot}"
        >
            <img src="https://flagcdn.com/w40/${team[1]}.png" alt="${team[0]}">
            <span>${team[0]}</span>
        </div>
    `;
}

function createEmptySlot() {
    return `<div class="team-slot empty">TBD</div>`;
}

function setupBracketClicks() {
    const mainBracket = document.getElementById("main-bracket");
    if (!mainBracket) return;

    mainBracket.onclick = event => {
        if (!bracketGenerated) return;

        const slot = event.target.closest(".team-slot");
        if (!slot || slot.classList.contains("empty")) return;

        const teamName = slot.dataset.teamName;
        const teamCode = slot.dataset.teamCode;
        const prefix = slot.dataset.prefix;
        const round = Number(slot.dataset.round);
        const match = Number(slot.dataset.match);

        if (!teamName || !teamCode || !prefix || Number.isNaN(round) || Number.isNaN(match)) return;

        const finalId = prefix === "L" ? "final-left" : "final-right";

        selectWinner(slot);
        registerPick(`${prefix}-${round}-${match}`);
        advanceTeam(prefix, finalId, teamName, teamCode, round, match);
        updateProgressUI();
    };
}

function selectWinner(slot) {
    const parentMatch = slot.closest(".match");
    if (!parentMatch) return;

    const allSlots = parentMatch.querySelectorAll(".team-slot");
    allSlots.forEach(item => {
        item.classList.remove("selected", "loser");
        if (!item.classList.contains("empty") && item !== slot) {
            item.classList.add("loser");
        }
    });

    slot.classList.add("selected");
}

function registerPick(id) {
    madePicks.add(id);
}

function advanceTeam(prefix, finalId, teamName, teamCode, round, match) {
    lastAdvancedPrefix = prefix;
    lastAdvancedRound = round;
    lastAdvancedMatch = match;

    if (round === 1) {
        updateSlot(prefix, 2, Math.floor(match / 2), match % 2, teamName, teamCode);
    }

    if (round === 2) {
        updateSlot(prefix, 3, Math.floor(match / 2), match % 2, teamName, teamCode);
    }

    if (round === 3) {
        updateSlot(prefix, 4, Math.floor(match / 2), match % 2, teamName, teamCode);
    }

    if (round === 4) {
        updateFinal(finalId, teamName, teamCode);
    }

    setTimeout(() => {
        drawConnectors();
        flashAdvancedConnector();
    }, 30);
}

function updateSlot(prefix, round, match, slotIndex, teamName, teamCode) {
    const matchBox = document.querySelector(`.match[data-prefix="${prefix}"][data-round="${round}"][data-match="${match}"]`);
    if (!matchBox) return;

    const slots = matchBox.querySelectorAll(".team-slot");
    const targetSlot = slots[slotIndex];
    if (!targetSlot) return;

    targetSlot.outerHTML = `
        <div
            class="team-slot advanced"
            data-team-name="${teamName}"
            data-team-code="${teamCode}"
            data-prefix="${prefix}"
            data-round="${round}"
            data-match="${match}"
            data-slot="${slotIndex}"
        >
            <img src="https://flagcdn.com/w40/${teamCode}.png" alt="${teamName}">
            <span>${teamName}</span>
        </div>
    `;

    setTimeout(() => {
        document.querySelectorAll(".team-slot.advanced").forEach(slot => slot.classList.remove("advanced"));
    }, 500);
}

function updateFinal(finalId, teamName, teamCode) {
    const finalSlot = document.getElementById(finalId);
    if (!finalSlot) return;

    finalSlot.innerHTML = `
        <img src="https://flagcdn.com/w40/${teamCode}.png" alt="${teamName}">
        <span>${teamName}</span>
    `;

    finalSlot.dataset.teamName = teamName;
    finalSlot.dataset.teamCode = teamCode;
    finalSlot.classList.add("advanced");

    setTimeout(() => finalSlot.classList.remove("advanced"), 500);
}

function setupFinalClick() {
    const leftFinal = document.getElementById("final-left");
    const rightFinal = document.getElementById("final-right");
    if (!leftFinal || !rightFinal) return;

    [leftFinal, rightFinal].forEach(finalSlot => {
        finalSlot.addEventListener("click", () => {
            if (!bracketGenerated || !finalSlot.dataset.teamName) return;

            leftFinal.classList.remove("selected", "loser");
            rightFinal.classList.remove("selected", "loser");

            if (finalSlot === leftFinal) {
                leftFinal.classList.add("selected");
                rightFinal.classList.add("loser");
            } else {
                rightFinal.classList.add("selected");
                leftFinal.classList.add("loser");
            }

            registerPick("FINAL-WINNER");
            updateProgressUI();
        });
    });
}

function getBracketStatus() {
    const leftFinal = document.getElementById("final-left");
    const rightFinal = document.getElementById("final-right");

    const leftFinalReady = Boolean(leftFinal && leftFinal.dataset.teamName);
    const rightFinalReady = Boolean(rightFinal && rightFinal.dataset.teamName);
    const championSelected = Boolean(leftFinal && leftFinal.classList.contains("selected")) || Boolean(rightFinal && rightFinal.classList.contains("selected"));

    return {
        leftFinalReady,
        rightFinalReady,
        championSelected,
        bracketReady: leftFinalReady && rightFinalReady && championSelected
    };
}

function updateProgressUI() {
    const groupsCount = document.getElementById("groups-count");
    const bracketCount = document.getElementById("bracket-count");
    const progressCount = document.getElementById("progress-count");
    const submitButton = document.getElementById("submit-picks");
    const submitStatus = document.getElementById("submit-status");
    const generateBtn = document.getElementById("generate-bracket");

    const groupProgress = completedGroups.size;
    const bracketProgress = Math.min(madePicks.size, 31);
    const totalProgress = groupProgress + bracketProgress;

    if (groupsCount) groupsCount.textContent = `${groupProgress}/12`;
    if (bracketCount) bracketCount.textContent = `${bracketProgress}/31`;
    if (progressCount) progressCount.textContent = `${totalProgress}/43`;
    if (generateBtn) generateBtn.disabled = groupProgress < 12;

    updateOddsCard();

    if (!submitButton || !submitStatus) return;

    submitButton.disabled = true;
    submitStatus.classList.remove("ready");

    if (!bracketGenerated) {
        submitStatus.textContent = "Generate bracket first";
        return;
    }

    const status = getBracketStatus();

    if (!status.leftFinalReady || !status.rightFinalReady) {
        submitStatus.textContent = "Complete both finalists first";
        return;
    }

    if (!status.championSelected) {
        submitStatus.textContent = "Select the final winner";
        return;
    }

    if (bracketProgress < 31) {
        submitStatus.textContent = `Complete bracket picks first (${bracketProgress}/31)`;
        return;
    }

    if (!walletConnected) {
        submitStatus.textContent = "Connect wallet and switch to Rialo Testnet";
        return;
    }

    submitButton.disabled = false;
    submitStatus.textContent = "Ready to submit on Rialo Testnet";
    submitStatus.classList.add("ready");
}

function setupEntryOdds() {
    const entryInput = document.getElementById("entry-amount-input");

    if (!entryInput) {
        updateOddsCard();
        return;
    }

    const defaultSmallAmount = "0.000001";

    entryInput.setAttribute("min", "0.000000000000000001");
    entryInput.setAttribute("step", "any");
    entryInput.setAttribute("inputmode", "decimal");

    if (!entryInput.value || Number(entryInput.value) <= 0) {
        entryInput.value = defaultSmallAmount;
    }

    selectedEntryAmount = Number(entryInput.value) || Number(defaultSmallAmount);

    entryInput.addEventListener("input", () => {
        const value = Number(entryInput.value);
        selectedEntryAmount = value > 0 ? value : 0;
        updateOddsCard();
    });

    entryInput.addEventListener("blur", () => {
        const value = Number(entryInput.value);
        if (!entryInput.value || !value || value <= 0) {
            entryInput.value = defaultSmallAmount;
            selectedEntryAmount = Number(defaultSmallAmount);
            updateOddsCard();
        }
    });

    updateOddsCard();
}

function getSelectedChampionName() {
    const leftFinal = document.getElementById("final-left");
    const rightFinal = document.getElementById("final-right");

    if (leftFinal && leftFinal.classList.contains("selected")) {
        return leftFinal.dataset.teamName || "";
    }

    if (rightFinal && rightFinal.classList.contains("selected")) {
        return rightFinal.dataset.teamName || "";
    }

    return "";
}

function getTeamRating(teamName) {
    return teamRatings[teamName] || 70;
}

function calculateChampionOdds(teamName) {
    if (!teamName) return 1.00;

    const rating = getTeamRating(teamName);

    if (rating >= 92) return 1.15;
    if (rating >= 88) return 1.45;
    if (rating >= 84) return 1.85;
    if (rating >= 78) return 2.40;
    if (rating >= 70) return 3.20;
    if (rating >= 62) return 4.10;

    return 5.00;
}

function getRiskLevelFromOdds(odds) {
    if (odds <= 1.50) return "Low";
    if (odds <= 2.50) return "Medium";
    if (odds <= 4.00) return "High";
    return "Underdog";
}

function updateOddsCard() {
    const oddsEl = document.getElementById("current-odds");
    const returnEl = document.getElementById("potential-return");
    const riskEl = document.getElementById("risk-level");
    const helpEl = document.getElementById("odds-help");
    const entryInput = document.getElementById("entry-amount-input");

    if (!oddsEl || !returnEl || !riskEl || !helpEl) return;

    if (entryInput) {
        const inputValue = Number(entryInput.value);
        selectedEntryAmount = inputValue > 0 ? inputValue : 0;
    }

    const championName = getSelectedChampionName();
    const odds = calculateChampionOdds(championName);
    const safeEntryAmount = selectedEntryAmount > 0 ? selectedEntryAmount : 0;
    const potentialReturn = safeEntryAmount * odds;
    const risk = getRiskLevelFromOdds(odds);

    oddsEl.textContent = `${odds.toFixed(2)}x`;
    returnEl.textContent = `${potentialReturn.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 })} RLO`;
    riskEl.textContent = risk;

    if (!championName) {
        oddsEl.textContent = "1.00x";
        returnEl.textContent = `${safeEntryAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 })} RLO`;
        riskEl.textContent = "Low";
        helpEl.textContent = "Select your champion to calculate odds.";
        return;
    }

    if (risk === "Low") {
        helpEl.textContent = "Favorite picks have lower odds but safer returns.";
    } else if (risk === "Medium") {
        helpEl.textContent = "Balanced predictions can give stronger returns.";
    } else if (risk === "High") {
        helpEl.textContent = "Higher-risk predictions can increase your potential return.";
    } else {
        helpEl.textContent = "Underdog picks increase your odds.";
    }
}

function cleanRialoTwitterUsername(value) {
    return String(value || "")
        .trim()
        .replace(/^@+/, "")
        .replace(/[^a-zA-Z0-9_]/g, "")
        .slice(0, 32);
}

function setupWallet() {
    const walletButton = document.getElementById("connect-wallet");
    const walletStatus = document.getElementById("wallet-status");
    const lockOverlay = document.getElementById("wallet-lock-overlay");
    const lockConnectBtn = document.getElementById("lock-connect-btn");

    if (!walletButton || !walletStatus) return;

    document.body.classList.remove("wallet-locked");

    function walletIconMarkup() {
        return `
            <svg class="wallet-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <path d="M3 7.5C3 6.39543 3.89543 5.5 5 5.5H18.5C19.3284 5.5 20 6.17157 20 7V8.5H16.5C14.8431 8.5 13.5 9.84315 13.5 11.5C13.5 13.1569 14.8431 14.5 16.5 14.5H20V16.5C20 17.6046 19.1046 18.5 18 18.5H5C3.89543 18.5 3 17.6046 3 16.5V7.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M16.5 9H21V14H16.5C15.1193 14 14 12.8807 14 11.5C14 10.1193 15.1193 9 16.5 9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <circle cx="17.5" cy="11.5" r="0.9" fill="currentColor"/>
            </svg>
        `;
    }

    function setWalletButtonText(text) {
        walletButton.innerHTML = `${walletIconMarkup()}<span>${text}</span>`;
    }

    function shortAddress(address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    function hideWalletOverlay() {
        document.body.classList.remove("wallet-locked");
        if (lockOverlay) lockOverlay.classList.add("hidden");
    }

    function getTwitterStorageKey(address) {
        return `rialo-x-username-${String(address || "").toLowerCase()}`;
    }

    function showTwitterUsernameBox(address) {
        const twitterBox = document.getElementById("twitter-username-box");
        const twitterInput = document.getElementById("twitter-username-input");
        const twitterConfirmBtn = document.getElementById("twitter-confirm-btn");
        const twitterSaveStatus = document.getElementById("twitter-save-status");

        if (!twitterBox || !twitterInput || !address) return;

        const storageKey = getTwitterStorageKey(address);
        const savedUsername = localStorage.getItem(storageKey) || "";

        function setStatus(message, type = "") {
            if (!twitterSaveStatus) return;

            twitterSaveStatus.textContent = message;
            twitterSaveStatus.classList.remove("saved", "error");

            if (type) {
                twitterSaveStatus.classList.add(type);
            }
        }

        function hideAfterSaved() {
            setTimeout(() => {
                twitterBox.classList.add("hidden");
            }, 650);
        }

        function saveUsername() {
            const cleaned = cleanRialoTwitterUsername(twitterInput.value);

            if (!cleaned || cleaned.length < 2) {
                setStatus("Please enter a valid X username.", "error");
                return;
            }

            twitterInput.value = cleaned;
            localStorage.setItem(storageKey, cleaned);

            if (twitterConfirmBtn) {
                twitterConfirmBtn.textContent = "Saved";
                twitterConfirmBtn.classList.add("saved");
            }

            setStatus(`Saved: @${cleaned}`, "saved");

            console.log("Rialo saved X username:", {
                wallet: address,
                username: cleaned
            });

            hideAfterSaved();
        }

        if (savedUsername) {
            twitterInput.value = cleanRialoTwitterUsername(savedUsername);
            twitterBox.classList.add("hidden");
            return;
        }

        twitterInput.value = "";
        twitterBox.classList.remove("hidden");

        if (twitterConfirmBtn) {
            twitterConfirmBtn.style.display = "block";
            twitterConfirmBtn.textContent = "Confirm";
            twitterConfirmBtn.classList.remove("saved");
            twitterConfirmBtn.onclick = saveUsername;
        }

        setStatus("Enter your X username, then confirm.");

        twitterInput.oninput = () => {
            const cleaned = cleanRialoTwitterUsername(twitterInput.value);

            if (twitterInput.value !== cleaned) {
                twitterInput.value = cleaned;
            }

            if (twitterConfirmBtn) {
                twitterConfirmBtn.textContent = "Confirm";
                twitterConfirmBtn.classList.remove("saved");
            }

            setStatus("Enter your X username, then confirm.");
        };

        twitterInput.onkeydown = event => {
            if (event.key === "Enter") {
                event.preventDefault();
                saveUsername();
            }
        };
    }

    function hideTwitterUsernameBox() {
        const twitterBox = document.getElementById("twitter-username-box");
        const twitterSaveStatus = document.getElementById("twitter-save-status");
        const twitterConfirmBtn = document.getElementById("twitter-confirm-btn");

        if (twitterBox) {
            twitterBox.classList.add("hidden");
        }

        if (twitterSaveStatus) {
            twitterSaveStatus.textContent = "Enter your X username, then confirm.";
            twitterSaveStatus.classList.remove("saved", "error");
        }

        if (twitterConfirmBtn) {
            twitterConfirmBtn.textContent = "Confirm";
            twitterConfirmBtn.style.display = "block";
            twitterConfirmBtn.classList.remove("saved");
            twitterConfirmBtn.classList.remove("confirmed");
        }
    }

    function unlockSite(address) {
        walletConnected = true;
        connectedWalletAddress = address;

        setWalletButtonText("Disconnect Wallet");
        walletStatus.textContent = `${shortAddress(address)} - Rialo Testnet`;
        walletStatus.classList.add("connected");
        walletButton.classList.add("wallet-connected");

        showTwitterUsernameBox(address);
        renderPredictionHistory();

        hideWalletOverlay();
        updateProgressUI();
        if (window.refreshRialoMarketUi) {
            window.refreshRialoMarketUi();
        }
        if (window.refreshRialoSwapUi) {
            window.refreshRialoSwapUi();
        }
        refreshNftUiState().catch(error => {
            console.warn("Failed to refresh NFT UI after wallet unlock:", error);
        });
        setTimeout(drawConnectors, 100);
    }

    function disconnectUI() {
        walletConnected = false;
        connectedWalletAddress = "";

        setWalletButtonText("Connect Wallet");
        walletStatus.textContent = "Wallet not connected";
        walletStatus.classList.remove("connected");
        walletButton.classList.remove("wallet-connected");

        hideTwitterUsernameBox();
        renderPredictionHistory();

        hideWalletOverlay();
        updateProgressUI();
        if (window.refreshRialoMarketUi) {
            window.refreshRialoMarketUi();
        }
        if (window.refreshRialoSwapUi) {
            window.refreshRialoSwapUi();
        }
        refreshNftUiState().catch(error => {
            console.warn("Failed to refresh NFT UI after disconnect:", error);
        });
    }

    function wrongNetworkUI(address = "") {
        walletConnected = false;
        connectedWalletAddress = address;

        setWalletButtonText("Switch Network");
        walletStatus.textContent = "Switch to Rialo Testnet";
        walletStatus.classList.remove("connected");
        walletButton.classList.remove("wallet-connected");

        hideTwitterUsernameBox();
        renderPredictionHistory();

        hideWalletOverlay();
        updateProgressUI();
        if (window.refreshRialoMarketUi) {
            window.refreshRialoMarketUi();
        }
        if (window.refreshRialoSwapUi) {
            window.refreshRialoSwapUi();
        }
        refreshNftUiState().catch(error => {
            console.warn("Failed to refresh NFT UI after wrong network state:", error);
        });
    }

    async function switchToRialoTestnet() {
        if (!window.ethereum) return false;

        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: RIALO_TESTNET.chainId }]
            });
            return true;
        } catch (switchError) {
            if (switchError && switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [RIALO_TESTNET]
                    });
                    return true;
                } catch (addError) {
                    console.error("Failed to add Rialo Testnet:", addError);
                    alert("Failed to add Rialo Testnet to your wallet.");
                    return false;
                }
            }

            if (switchError && switchError.code === 4001) {
                alert("Network switch rejected.");
            } else {
                console.error("Failed to switch to Rialo Testnet:", switchError);
                alert("Please switch your wallet to Rialo Testnet.");
            }

            return false;
        }
    }

    async function connectMetaMask() {
        if (!window.ethereum) {
            alert("MetaMask is not installed. Please install MetaMask first.");
            window.open("https://metamask.io/download/", "_blank");
            return;
        }

        try {
            setWalletButtonText("Connecting...");
            walletStatus.textContent = "Connecting wallet...";

            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

            if (!accounts || accounts.length === 0) {
                disconnectUI();
                alert("No wallet account found.");
                return;
            }

            walletStatus.textContent = "Switching to Rialo Testnet...";

            const switched = await switchToRialoTestnet();
            if (!switched) {
                wrongNetworkUI(accounts[0]);
                return;
            }

            unlockSite(accounts[0]);
        } catch (error) {
            console.error("Wallet connection failed:", error);

            setWalletButtonText("Connect Wallet");
            walletStatus.textContent = "Wallet not connected";
            walletStatus.classList.remove("connected");
            walletButton.classList.remove("wallet-connected");

            hideTwitterUsernameBox();
            renderPredictionHistory();
            if (window.refreshRialoMarketUi) {
                window.refreshRialoMarketUi();
            }

            if (error && error.code === 4001) {
                alert("Wallet connection rejected.");
            } else {
                alert("Failed to connect wallet.");
            }
        }
    }

    walletButton.addEventListener("click", () => {
        if (walletConnected) {
            disconnectUI();
            return;
        }

        connectMetaMask();
    });

    if (lockConnectBtn) {
        lockConnectBtn.addEventListener("click", connectMetaMask);
    }

    if (window.ethereum) {
        window.ethereum.request({ method: "eth_accounts" })
            .then(async accounts => {
                if (!accounts || accounts.length === 0) {
                    disconnectUI();
                    return;
                }

                const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
                if (currentChainId === RIALO_TESTNET.chainId) {
                    unlockSite(accounts[0]);
                } else {
                    wrongNetworkUI(accounts[0]);
                }
            })
            .catch(disconnectUI);

        window.ethereum.on("accountsChanged", accounts => {
            if (!accounts || accounts.length === 0) {
                disconnectUI();
            } else {
                connectMetaMask();
            }
        });

        window.ethereum.on("chainChanged", chainId => {
            if (chainId === RIALO_TESTNET.chainId) {
                window.ethereum.request({ method: "eth_accounts" })
                    .then(accounts => {
                        if (accounts && accounts.length > 0) {
                            unlockSite(accounts[0]);
                        } else {
                            disconnectUI();
                        }
                    })
                    .catch(disconnectUI);
            } else {
                wrongNetworkUI(connectedWalletAddress);
            }
        });
    } else {
        disconnectUI();
        walletStatus.textContent = "MetaMask not detected";
    }
}

function isValidEvmAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function getTransactionReceiverAddress(account) {
    if (RIALO_RECEIVER_ADDRESS && isValidEvmAddress(RIALO_RECEIVER_ADDRESS)) {
        return RIALO_RECEIVER_ADDRESS;
    }

    return account;
}

function decimalAmountToWeiHex(amountText) {
    const cleanAmount = String(amountText || "").trim();

    if (!cleanAmount || Number(cleanAmount) <= 0) {
        throw new Error("Invalid entry amount.");
    }

    const parts = cleanAmount.split(".");
    const wholePart = parts[0] || "0";
    const decimalPart = parts[1] || "";

    if (parts.length > 2) throw new Error("Invalid entry amount.");
    if (!/^\d+$/.test(wholePart)) throw new Error("Invalid whole amount.");
    if (decimalPart && !/^\d+$/.test(decimalPart)) throw new Error("Invalid decimal amount.");

    const safeWhole = wholePart.replace(/^0+(?=\d)/, "") || "0";
    const safeDecimals = decimalPart.slice(0, 18).padEnd(18, "0");
    const weiString = safeWhole + safeDecimals;
    const weiValue = BigInt(weiString);

    if (weiValue <= 0n) throw new Error("Entry amount must be greater than 0.");

    return "0x" + weiValue.toString(16);
}

async function ensureRialoTestnetForTransaction() {
    if (!window.ethereum) {
        alert("MetaMask is not installed.");
        return false;
    }

    try {
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        if (currentChainId === RIALO_TESTNET.chainId) return true;

        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: RIALO_TESTNET.chainId }]
        });

        return true;
    } catch (switchError) {
        if (switchError && switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [RIALO_TESTNET]
                });
                return true;
            } catch (addError) {
                console.error("Failed to add Rialo Testnet:", addError);
                alert("Failed to add Rialo Testnet to your wallet.");
                return false;
            }
        }

        if (switchError && switchError.code === 4001) {
            alert("Network switch rejected.");
        } else {
            console.error("Failed to switch network:", switchError);
            alert("Please switch your wallet to Rialo Testnet.");
        }

        return false;
    }
}

async function sendRialoEntryTransaction() {
    const submitStatus = document.getElementById("submit-status");
    const entryInput = document.getElementById("entry-amount-input");

    if (!window.ethereum) {
        alert("MetaMask is not installed.");
        return null;
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) {
        alert("No wallet account found.");
        return null;
    }

    const account = accounts[0];
    connectedWalletAddress = account;

    const switched = await ensureRialoTestnetForTransaction();
    if (!switched) return null;

    const entryAmount = entryInput ? entryInput.value : "0";
    let valueHex;

    try {
        valueHex = decimalAmountToWeiHex(RIALO_REAL_NATIVE_TX_VALUE);
    } catch (error) {
        console.error("Invalid transaction amount:", error);
        alert("Please enter a valid entry amount.");
        return null;
    }

    const receiverAddress = getTransactionReceiverAddress(account);

    if (submitStatus) {
        submitStatus.textContent = "Waiting for wallet signature...";
        submitStatus.classList.remove("ready");
    }

    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [
                {
                    from: account,
                    to: receiverAddress,
                    value: valueHex
                }
            ]
        });

        if (submitStatus) {
            submitStatus.textContent = `Transaction sent: ${txHash.slice(0, 10)}...${txHash.slice(-6)}`;
            submitStatus.classList.add("ready");
        }

        console.log("Rialo Rialo Testnet transaction:", txHash);

        return txHash;
    } catch (error) {
        console.error("Transaction failed:", error);

        if (submitStatus) {
            submitStatus.textContent = "Transaction rejected or failed";
            submitStatus.classList.remove("ready");
        }

        if (error && error.code === 4001) {
            alert("Transaction rejected.");
        } else {
            alert("Transaction failed. Check your Rialo Testnet balance.");
        }

        return null;
    }
}

function setupHowPanel() {
    const howBtn = document.getElementById("how-btn");
    const howSection = document.getElementById("how-it-works-section");

    if (!howBtn || !howSection) return;

    howBtn.addEventListener("click", () => {
        howSection.classList.remove("reveal-how");
        howSection.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => howSection.classList.add("reveal-how"), 500);
    });
}

function getSavedTwitterUsername() {
    if (!connectedWalletAddress) return "";

    const storageKey = `rialo-x-username-${String(connectedWalletAddress || "").toLowerCase()}`;
    const saved = localStorage.getItem(storageKey) || "";

    return cleanRialoTwitterUsername(saved);
}

function getTwitterAvatarUrl(username) {
    const cleanUsername = cleanRialoTwitterUsername(username);

    if (!cleanUsername) {
        return "";
    }

    return `https://unavatar.io/twitter/${encodeURIComponent(cleanUsername)}`;
}

function getFallbackAvatar(username) {
    const cleanUsername = cleanRialoTwitterUsername(username || "Rialo");
    const letter = cleanUsername ? cleanUsername.charAt(0).toUpperCase() : "R";

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
            <defs>
                <radialGradient id="g" cx="30%" cy="20%" r="80%">
                    <stop offset="0%" stop-color="#efe2bd"/>
                    <stop offset="45%" stop-color="#c9a45c"/>
                    <stop offset="100%" stop-color="#090909"/>
                </radialGradient>
            </defs>
            <rect width="240" height="240" rx="120" fill="url(#g)"/>
            <circle cx="120" cy="120" r="104" fill="none" stroke="#efe2bd" stroke-width="7" opacity="0.55"/>
            <text
                x="50%"
                y="54%"
                text-anchor="middle"
                dominant-baseline="middle"
                font-family="Arial, sans-serif"
                font-size="92"
                font-weight="900"
                fill="#090909"
            >
                ${letter}
            </text>
        </svg>
    `)}`;
}

function getTicketShareText(txHash = "") {
    const username = getSavedTwitterUsername();
    const displayUsername = username ? `@${username}` : "I";

    const txText = txHash
        ? `\n\nTransaction: https://sepolia.basescan.org/tx/${txHash}`
        : "";

    return `${displayUsername} just entered the Rialo PM 120,000 RLO Prize Pool.

I submitted my Rialo PM prediction on-chain through Rialo.

#Rialo #RialoWorldCup #BaseSepolia${txText}`;
}

function openShareOnX(txHash = "") {
    const text = getTicketShareText(txHash);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

    window.open(shareUrl, "_blank", "noopener,noreferrer");
}

function downloadPrizeTicketImage() {
    const ticketImage = document.querySelector(".ticket-base-img");
    const username = getSavedTwitterUsername() || "rialo-player";

    if (!ticketImage) return;

    const link = document.createElement("a");
    link.href = ticketImage.src;
    link.download = `rialo-prize-ticket-${username}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function createTicketConfetti() {
    const amount = 90;

    for (let i = 0; i < amount; i++) {
        const piece = document.createElement("span");
        piece.className = "ticket-confetti";

        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.animationDelay = `${Math.random() * 0.75}s`;
        piece.style.animationDuration = `${2.2 + Math.random() * 1.6}s`;
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(piece);

        setTimeout(() => {
            piece.remove();
        }, 4300);
    }
}

function showPrizePoolTicket(txHash = "") {
    const overlay = document.getElementById("ticket-success-overlay");
    const closeBtn = document.getElementById("ticket-close-btn");
    const avatarImg = document.getElementById("ticket-user-avatar");
    const usernameEl = document.getElementById("ticket-user-name");
    const walletMini = document.getElementById("ticket-wallet-mini");
    const txLink = document.getElementById("ticket-tx-link");
    const downloadBtn = document.getElementById("ticket-download-btn");
    const shareXBtn = document.getElementById("ticket-share-x-btn");

    if (!overlay || !avatarImg || !usernameEl) return;

    const cleanUsername = getSavedTwitterUsername();
    const displayUsername = cleanUsername ? `@${cleanUsername}` : "@player";

    usernameEl.textContent = displayUsername;

    if (walletMini && connectedWalletAddress) {
        walletMini.textContent = `${connectedWalletAddress.slice(0, 6)}...${connectedWalletAddress.slice(-4)} confirmed`;
    }

    const fallbackAvatar = getFallbackAvatar(cleanUsername || "Rialo");
    const avatarUrl = getTwitterAvatarUrl(cleanUsername);

    avatarImg.removeAttribute("src");
    avatarImg.src = avatarUrl || fallbackAvatar;

    avatarImg.onerror = () => {
        avatarImg.onerror = null;
        avatarImg.src = fallbackAvatar;
    };

    if (txLink) {
        if (txHash) {
            txLink.href = `https://sepolia.basescan.org/tx/${txHash}`;
            txLink.style.display = "inline-flex";
        } else {
            txLink.href = "#";
            txLink.style.display = "none";
        }
    }

    if (downloadBtn) {
        downloadBtn.onclick = () => {
            downloadPrizeTicketImage();
        };
    }

    if (shareXBtn) {
        shareXBtn.onclick = () => {
            openShareOnX(txHash);
        };
    }

    overlay.classList.remove("hidden");
    createTicketConfetti();

    if (closeBtn) {
        closeBtn.onclick = () => {
            overlay.classList.add("hidden");
        };
    }

    overlay.onclick = event => {
        if (event.target === overlay) {
            overlay.classList.add("hidden");
        }
    };
}

function getHistoryStorageKey() {
    if (!connectedWalletAddress) return "";
    return `rialo-prediction-history-${String(connectedWalletAddress).toLowerCase()}`;
}

function getChampionPredictionName() {
    const leftFinal = document.getElementById("final-left");
    const rightFinal = document.getElementById("final-right");

    if (leftFinal && leftFinal.classList.contains("selected")) {
        return leftFinal.dataset.teamName || "Unknown";
    }

    if (rightFinal && rightFinal.classList.contains("selected")) {
        return rightFinal.dataset.teamName || "Unknown";
    }

    return "Unknown";
}

function getCurrentEntryAmountText() {
    const entryInput = document.getElementById("entry-amount-input");
    const value = entryInput ? entryInput.value : "0";
    return value || "0";
}

function getCurrentOddsText() {
    const oddsEl = document.getElementById("current-odds");
    return oddsEl ? oddsEl.textContent : "1.00x";
}

function getStoredHistory(key) {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function savePredictionHistory(txHash = "") {
    const key = getHistoryStorageKey();
    if (!key) return;

    const oldHistory = getStoredHistory(key);

    const record = {
        champion: getChampionPredictionName(),
        entryAmount: getCurrentEntryAmountText(),
        odds: getCurrentOddsText(),
        txHash,
        date: new Date().toISOString()
    };

    const newHistory = [record, ...oldHistory].slice(0, 30);

    localStorage.setItem(key, JSON.stringify(newHistory));
    renderPredictionHistory();
}

function formatHistoryDate(isoDate) {
    try {
        return new Date(isoDate).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch {
        return "Unknown date";
    }
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderPredictionHistory() {
    const historyList = document.getElementById("history-list");
    const historyWalletNote = document.getElementById("history-wallet-note");

    if (!historyList) return;

    if (!connectedWalletAddress) {
        historyList.innerHTML = `
            <div class="history-empty">
                Connect your wallet to see your prediction history.
            </div>
        `;

        if (historyWalletNote) {
            historyWalletNote.textContent = "Connect wallet to see your history";
        }

        return;
    }

    const key = getHistoryStorageKey();
    const history = getStoredHistory(key);

    if (historyWalletNote) {
        historyWalletNote.textContent = `${connectedWalletAddress.slice(0, 6)}...${connectedWalletAddress.slice(-4)} history`;
    }

    if (!history.length) {
        historyList.innerHTML = `
            <div class="history-empty">
                No predictions submitted yet. Your completed Rialo entries will appear here.
            </div>
        `;
        return;
    }

    historyList.innerHTML = history.map(item => {
        const txShort = item.txHash
            ? `${item.txHash.slice(0, 8)}...${item.txHash.slice(-6)}`
            : "No tx";

        const txUrl = item.txHash
            ? `https://sepolia.basescan.org/tx/${item.txHash}`
            : "#";

        return `
            <div class="history-item">
                <div class="history-main">
                    <strong>${escapeHTML(item.champion)}</strong>
                    <span>Champion prediction</span>
                </div>

                <div class="history-stat">
                    <strong>${escapeHTML(item.entryAmount)} RLO</strong>
                    <span>Entry amount</span>
                </div>

                <div class="history-stat">
                    <strong>${escapeHTML(item.odds)}</strong>
                    <span>Odds at submit</span>
                </div>

                <a class="history-tx" href="${txUrl}" target="_blank" rel="noopener noreferrer">
                    ${escapeHTML(txShort)}
                </a>

                <div class="history-stat">
                    <strong>${escapeHTML(formatHistoryDate(item.date))}</strong>
                    <span>Submitted date</span>
                </div>
            </div>
        `;
    }).join("");
}

function resetForNewPlay() {
    bracketGenerated = false;
    madePicks.clear();
    lastAdvancedPrefix = null;
    lastAdvancedRound = null;
    lastAdvancedMatch = null;

    resetBracket();

    const mainBracket = document.getElementById("main-bracket");
    const bracketBtn = document.getElementById("bracket-tab-btn");
    const groupsBtn = document.getElementById("groups-tab-btn");
    const groupsView = document.getElementById("groups-view");
    const bracketView = document.getElementById("bracket-view");
    const submitButton = document.getElementById("submit-picks");
    const submitStatus = document.getElementById("submit-status");

    if (mainBracket) {
        mainBracket.classList.add("bracket-locked");
        mainBracket.classList.remove("bracket-ready");
    }

    if (bracketBtn) {
        bracketBtn.classList.add("locked");
        bracketBtn.classList.remove("active");
    }

    if (groupsBtn) {
        groupsBtn.classList.add("active");
    }

    if (groupsView) {
        groupsView.classList.add("active");
    }

    if (bracketView) {
        bracketView.classList.remove("active");
    }

    if (submitButton) {
        submitButton.disabled = true;
    }

    renderGroups();
    updateProgressUI();

    if (submitStatus) {
        submitStatus.textContent = "You can play again. Generate a new bracket.";
        submitStatus.classList.remove("ready");
    }

    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 700);
}

function setupSubmit() {
    const submitButton = document.getElementById("submit-picks");
    const submitStatus = document.getElementById("submit-status");

    if (!submitButton || !submitStatus) return;

    submitButton.addEventListener("click", async () => {
        const bracketProgress = Math.min(madePicks.size, 31);
        const status = getBracketStatus();

        if (!bracketGenerated) {
            alert("Generate bracket first.");
            return;
        }

        if (!status.leftFinalReady || !status.rightFinalReady) {
            alert("Complete both finalists first.");
            return;
        }

        if (!status.championSelected) {
            alert("Select the final winner before submitting.");
            return;
        }

        if (bracketProgress < 31) {
            alert(`Complete all bracket picks first. Current: ${bracketProgress}/31`);
            return;
        }

        if (!walletConnected) {
            submitStatus.textContent = "Connect wallet and switch to Rialo Testnet";
            submitStatus.classList.remove("ready");
            alert("Connect your wallet and switch to Rialo Testnet first.");
            return;
        }

        submitButton.disabled = true;
        submitStatus.textContent = "Preparing Rialo Testnet transaction...";
        submitStatus.classList.remove("ready");

        const txHash = await sendRialoEntryTransaction();

        if (txHash) {
            submitStatus.textContent = `Submitted on Rialo Testnet: ${txHash.slice(0, 10)}...${txHash.slice(-6)}`;
            submitStatus.classList.add("ready");

            savePredictionHistory(txHash);
            showPrizePoolTicket(txHash);

            setTimeout(() => {
                resetForNewPlay();
            }, 1600);
        } else {
            submitButton.disabled = false;
        }
    });
}

function drawConnectors() {
    const svg = document.getElementById("connector-layer");
    const main = document.getElementById("main-bracket");

    if (!svg || !main) return;
    if (!bracketGenerated) return;

    svg.innerHTML = "";

    const mainRect = main.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${mainRect.width} ${mainRect.height}`);
    svg.setAttribute("width", mainRect.width);
    svg.setAttribute("height", mainRect.height);

    drawSideConnectors("L", "left", mainRect);
    drawSideConnectors("R", "right", mainRect);
    drawFinalConnector("L", "left", mainRect);
    drawFinalConnector("R", "right", mainRect);
}

function drawSideConnectors(prefix, side, mainRect) {
    for (let round = 1; round <= 3; round++) {
        const currentMatches = document.querySelectorAll(`.match[data-prefix="${prefix}"][data-round="${round}"]`);

        currentMatches.forEach(currentMatch => {
            const currentMatchIndex = Number(currentMatch.dataset.match);
            const nextMatchIndex = Math.floor(currentMatchIndex / 2);
            const nextMatch = document.querySelector(`.match[data-prefix="${prefix}"][data-round="${round + 1}"][data-match="${nextMatchIndex}"]`);

            if (!nextMatch) return;

            connectMatches(currentMatch, nextMatch, side, mainRect, {
                fromPrefix: prefix,
                fromRound: round,
                fromMatch: currentMatchIndex
            });
        });
    }
}

function drawFinalConnector(prefix, side, mainRect) {
    const lastMatch = document.querySelector(`.match[data-prefix="${prefix}"][data-round="4"][data-match="0"]`);
    const finalCard = document.getElementById("final-card");

    if (!lastMatch || !finalCard) return;

    connectMatches(lastMatch, finalCard, side, mainRect, {
        fromPrefix: prefix,
        fromRound: 4,
        fromMatch: 0
    });
}

function connectMatches(fromEl, toEl, side, mainRect, meta = {}) {
    const from = fromEl.getBoundingClientRect();
    const to = toEl.getBoundingClientRect();

    let x1;
    let y1;
    let x2;
    let y2;

    if (side === "left") {
        x1 = from.right - mainRect.left;
        y1 = from.top + from.height / 2 - mainRect.top;
        x2 = to.left - mainRect.left;
        y2 = to.top + to.height / 2 - mainRect.top;
    } else {
        x1 = from.left - mainRect.left;
        y1 = from.top + from.height / 2 - mainRect.top;
        x2 = to.right - mainRect.left;
        y2 = to.top + to.height / 2 - mainRect.top;
    }

    const middleX = (x1 + x2) / 2;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    path.setAttribute("d", `M ${x1} ${y1} H ${middleX} V ${y2} H ${x2}`);
    path.setAttribute("class", "connector-line");

    if (meta.fromPrefix) {
        path.dataset.fromPrefix = meta.fromPrefix;
        path.dataset.fromRound = String(meta.fromRound);
        path.dataset.fromMatch = String(meta.fromMatch);
    }

    document.getElementById("connector-layer").appendChild(path);
}

function flashAdvancedConnector() {
    if (!lastAdvancedPrefix || !lastAdvancedRound || lastAdvancedMatch === null) return;

    const line = document.querySelector(`.connector-line[data-from-prefix="${lastAdvancedPrefix}"][data-from-round="${lastAdvancedRound}"][data-from-match="${lastAdvancedMatch}"]`);
    if (!line) return;

    line.classList.add("flash-line");
    setTimeout(() => line.classList.remove("flash-line"), 900);
}

init();





























































