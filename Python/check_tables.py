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
        cur.execute("DESCRIBE btggasify_finance_live.tbl_GLcodemaster;")
        cols = cur.fetchall()
        for col in cols:
            print(col)
        
except Exception as e:
    print("Error:", e)
