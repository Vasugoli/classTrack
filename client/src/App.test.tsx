import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App.tsx";

describe("App", () => {
	test("shows landing hero", () => {
		render(<App />);
		// The main brand heading on the landing page
		expect(screen.getByText("classTrack")).toBeDefined();
		// And a section explaining the attendance process
		expect(screen.getByText("How attendance works")).toBeDefined();
	});
});
