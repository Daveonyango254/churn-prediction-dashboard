import unittest

from fastapi.testclient import TestClient

from backend.main import app


class ApiSmokeTests(unittest.TestCase):
    def test_core_endpoints_and_prediction_flow(self) -> None:
        with TestClient(app) as client:
            health = client.get("/api/health")
            self.assertEqual(health.status_code, 200)
            self.assertEqual(health.json()["status"], "ok")

            metadata = client.get("/api/metadata")
            self.assertEqual(metadata.status_code, 200)
            self.assertIn("default_profile", metadata.json())

            overview = client.get("/api/overview")
            self.assertEqual(overview.status_code, 200)
            self.assertGreater(overview.json()["total_customers"], 0)

            customers = client.get("/api/customers?limit=5")
            self.assertEqual(customers.status_code, 200)
            self.assertEqual(len(customers.json()), 5)

            prediction = client.post(
                "/api/predict",
                json={
                    "Contract": "Monthly",
                    "InternetService": "Fiber optic",
                    "TechSupport": "No",
                    "OnlineSecurity": "No",
                    "Tenure": 6,
                    "MonthlyCharges": 88.2,
                    "TotalCharges": 530.1,
                },
            )
            self.assertEqual(prediction.status_code, 200)
            self.assertIn("probability", prediction.json())
            self.assertIn("risk_notes", prediction.json())

    def test_demo_session_starts(self) -> None:
        with TestClient(app) as client:
            response = client.post("/api/demo/session", json={})
            self.assertEqual(response.status_code, 200)
            body = response.json()
            self.assertIn("session", body)
            self.assertIn("limits", body)


if __name__ == "__main__":
    unittest.main()
