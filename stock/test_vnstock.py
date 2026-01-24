
from vnstock import stock_historical_data, price_board
from datetime import datetime, timedelta

# Test Quote
print("--- QUOTE ---")
try:
    # price_board allows getting multiple tickers
    quote = price_board('VIC,VHM,FPT')
    print(quote.to_json(orient='records'))
except Exception as e:
    print("Quote Error:", e)

# Test History
print("\n--- HISTORY ---")
try:
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=100)).strftime('%Y-%m-%d')
    df = stock_historical_data(symbol='VIC', start_date=start_date, end_date=end_date, resolution='1D', type='stock')
    print(df.tail(2).to_json(orient='records'))
except Exception as e:
    print("History Error:", e)
