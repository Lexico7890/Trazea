
import time
import json
from playwright.sync_api import sync_playwright, expect

def verify_requests_flow(page):
    page.on("console", lambda msg: print(f"Browser console: {msg.type}: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"Browser error: {exc}"))

    # Mocks
    def handle_inventory(route):
        json_data = [
            {
                "id_repuesto": "uuid-1",
                "referencia": "REF-001",
                "nombre": "Aceite Motor",
                "stock_actual": 10,
                "cantidad_minima": 5,
                "estado_stock": "NORMAL",
                "descontinuado": False,
                "tipo": "Insumo"
            },
            {
                "id_repuesto": "uuid-2",
                "referencia": "REF-002",
                "nombre": "Filtro Aire",
                "stock_actual": 2,
                "cantidad_minima": 5,
                "estado_stock": "BAJO",
                "descontinuado": False,
                "tipo": "Repuesto"
            }
        ]
        headers = {"Content-Range": "0-1/2"}
        route.fulfill(json=json_data, headers=headers)

    def handle_user_locations(route):
        json_data = [{"id_localizacion": 1}]
        route.fulfill(json=json_data)

    def handle_locations(route):
        json_data = [
             {"id_localizacion": 1, "nombre": "Taller Principal"}
        ]
        route.fulfill(json=json_data)

    page.route("**/rest/v1/v_inventario_completo*", handle_inventory)
    page.route("**/rest/v1/usuarios_localizacion*", handle_user_locations)
    page.route("**/rest/v1/localizacion*", handle_locations)

    fake_session = {
        "state": {
            "sessionData": {
                "user": {
                    "id": "test-user-id",
                    "email": "test@example.com",
                    "role": {
                        "id_rol": "1",
                        "nombre": "Admin",
                        "descripcion": "Admin user",
                        "permissions": True
                    },
                    "locations": [{"id_localizacion": 1, "nombre": "Taller Principal"}]
                },
                "locations": [{"id_localizacion": 1, "nombre": "Taller Principal"}]
            },
            "isAuthenticated": True,
            "currentLocation": {"id_localizacion": 1, "nombre": "Taller Principal"}
        },
        "version": 0
    }

    # Go to root
    page.goto("http://localhost:5173/")

    # Inject localStorage
    json_session = json.dumps(fake_session)
    page.evaluate(f"""(data) => {{
        localStorage.setItem('user-storage', data);
        localStorage.setItem('minca_location_id', '1');
    }}""", json_session)

    # Reload
    page.reload()

    # Wait for dashboard
    try:
        expect(page.get_by_text("Mi inventario")).to_be_visible(timeout=10000)
    except:
        print("Failed to load dashboard")
        page.screenshot(path="verification/dashboard_fail.png")
        raise

    # Open Popover on the first item
    # The popover trigger has <Ellipsis> icon inside a button.
    # We can assume it's the only button in the row or select by icon.
    # Or just select the button in the last cell.
    try:
        expect(page.get_by_text("Aceite Motor")).to_be_visible()
        # Find the row for Aceite Motor
        row = page.get_by_role("row").filter(has_text="Aceite Motor")
        # Find the popover button inside. It is usually just a button with no text (just icon).
        popover_btn = row.get_by_role("button")
        popover_btn.click()
        print("Clicked Popover")

        # Now click "Solicitar" inside popover
        page.get_by_role("button", name="Solicitar").click()
        print("Clicked Solicitar")

    except:
        print("Failed to interact with popover")
        page.screenshot(path="verification/popover_fail.png")
        raise

    # Go to Requests directly
    page.goto("http://localhost:5173/solicitudes/creadas")

    # Verify Item in List
    expect(page.get_by_text("Aceite Motor")).to_be_visible()

    # Fill form
    # Select destination
    page.get_by_role("combobox").click()
    page.get_by_role("option", name="Taller Principal").click()

    # Type comment
    page.get_by_placeholder("Agregue un comentario...").fill("Necesito esto urgente")

    # Take screenshot
    time.sleep(1)
    page.screenshot(path="verification/requests_filled.png")
    print("Verification complete")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_requests_flow(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
