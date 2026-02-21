import pymysql

try:
    conn = pymysql.connect(
        host='76.13.18.34',
        user='btgsogdbu53r',
        password='FM0ipR$Zrt9eM',
        port=3306,
        cursorclass=pymysql.cursors.DictCursor
    )
    with conn.cursor() as cur:
        cur.execute("DESCRIBE btggasify_live.master_customer;")
        print("Customer cols:", [(c['Field'], c['Type']) for c in cur.fetchall()])
        
        cur.execute("DESCRIBE btggasify_masterpanel_live.master_supplier;")
        print("Supplier cols:", [(c['Field'], c['Type']) for c in cur.fetchall()])
        
        cur.execute("DESCRIBE btggasify_masterpanel_live.master_bank;")
        print("Bank cols:", [(c['Field'], c['Type']) for c in cur.fetchall()])
        
except Exception as e:
    print("Error:", e)
