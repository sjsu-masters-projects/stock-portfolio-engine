# Stock Portfolio Engine - Grader Test Cases

## Setup Instructions
1. **Unzip** the project folder.
2. **Start the Backend**:
   - Open a terminal and navigate to the `backend` folder.
   - Run: `pip install -r requirements.txt`
   - Run: `uvicorn app.main:app --reload`
   - The backend will start at `http://localhost:8000`.
3. **Start the Frontend**:
   - Open a new terminal and navigate to the `frontend` folder.
   - Run: `npm install`
   - Run: `npm run dev`
   - Open `http://localhost:3000` in your browser.

---

## Test Cases

### Test Case 1: Minimum Investment Validation
- **Action**: On the "Builder" page, try to set the investment amount to `$4,000` manually or using the slider. Click "Continue".
- **Expected Result**: An error message appears stating "Minimum investment is $5,000". The wizard prevents moving to the next step.

### Test Case 2: Multi-Step Wizard Flow
- **Action**: Set amount to `$10,000`. Click "Continue". Select the "Growth" strategy. Click "Review Portfolio".
- **Expected Result**: The UI smoothly transitions through 3 steps, displaying a summary of the $10,000 amount and the Growth strategy assets (NVDA, TSLA, AMZN, META) on the final Review step.

### Test Case 3: Generating a Portfolio (Backend Integration)
- **Action**: On the Review step, click "Generate Portfolio".
- **Expected Result**: The app transitions to the Dashboard. A success message might briefly appear. The Dashboard populates with data allocated specifically for the $10,000 across the selected strategy.

### Test Case 4: Dashboard - Real-time Ticker
- **Action**: View the top horizontal scrolling bar on the Dashboard.
- **Expected Result**: It displays mini-cards for the allocated stocks (e.g., NVDA, TSLA) with their current live prices fetched from Yahoo Finance (via the backend) and a 5-day return percentage indicator.

### Test Case 5: Dashboard - Risk Metrics
- **Action**: Look at the 4 metric cards below the ticker on the Dashboard.
- **Expected Result**: You should see computed values for Portfolio Beta, Volatility (5D), Diversification score, and Sharpe Ratio, reflecting the risk profile of the selected stocks.

### Test Case 6: Dashboard - Sortable Allocation Table
- **Action**: In the "Holdings" table, click on the "Weight" column header, then click it again.
- **Expected Result**: The rows sort dynamically in descending, then ascending order based on the allocated performance weight.

### Test Case 7: Stock Detail Modal
- **Action**: Click on any stock row in the "Holdings" table (or a ticker card).
- **Expected Result**: A beautiful glassmorphism modal opens displaying the stock's 52-week high/low, P/E ratio, Market Cap, and a list of the latest 5 news articles specific to that company. Press `Esc` or click the `X` to close it.

### Test Case 8: Saving & Loading Portfolios
- **Action**: Navigate to the "History" tab in the sidebar. Click "Save Current Portfolio".
- **Expected Result**: The current configuration is saved and appears under the "Saved Configurations" list with a timestamp. Clicking the "Play" (Load) icon on it restores that exact portfolio to the Dashboard.

### Test Case 9: Portfolio Comparison
- **Action**: Navigate to the "Compare" tab. Set amount to `$10,000`. Select "Index" for Portfolio A, and "Value" for Portfolio B. Click "Compare Portfolios".
- **Expected Result**: The app generates both portfolios simultaneously and displays a side-by-side comparison of their values, risk metrics, and historical trend lines. A "WINNER" badge is highlighted on the one with the higher 5-day simulated value.

### Test Case 10: Currency Conversion & Dark Mode
- **Action**: 
  1. Click the "USD" dropdown in the top right Header and select "EUR". Observe the dropdown state changes. (Note: Due to time constraints, local USD string conversion might not universally update all charts, but the UI state changes successfully).
  2. Click the Moon/Sun icon next to the currency dropdown.
- **Expected Result**: The entire application smoothly transitions from Light mode to a premium Dark Mode with glassmorphic backgrounds adapting correctly to the new dark color palette.
