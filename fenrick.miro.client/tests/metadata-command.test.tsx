/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { App } from "../src/app/App";
import { ExcelSyncService } from "../src/core/excel-sync-service";
import { EditMetadataModal } from "../src/ui/components/EditMetadataModal";
import { useRowData } from "../src/ui/hooks/use-row-data";

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

vi.mock("../src/ui/hooks/use-row-data");
vi.mock("../src/core/excel-sync-service");

describe("Edit Metadata command",
  () => {
    beforeEach(() => {
      global.miro = {
        board: {
          getSelection: vi.fn().mockResolvedValue([]),
          ui: { on: vi.fn() },
        },
      };
      (useRowData as unknown as vi.Mock).mockReturnValue({
        ID: "1",
        Name: "A"
      });
      (ExcelSyncService as unknown as vi.Mock).mockImplementation(() => ({
        updateShapesFromExcel: vi.fn().mockResolvedValue(undefined),
      }));
    });

    afterEach(() => {
      vi.clearAllMocks();
      delete global.miro;
    });

    test("opens modal and updates via service",
      async () => {
        render(<App/>);
        fireEvent.click(screen.getByTestId("start-button"));
        await act(async () => {
          fireEvent.keyDown(window, { key: "m", ctrlKey: true, altKey: true });
          await new Promise(r => setTimeout(r, 0));
        });
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        fireEvent.change(screen.getByDisplayValue("A"),
          { target: { value: "B" } });
        const svc = (ExcelSyncService as unknown as vi.Mock).mock.results[0]
          .value as { updateShapesFromExcel: vi.Mock };
        expect(svc.updateShapesFromExcel).toHaveBeenCalled();
      });

    test("query parameter opens EditMetadataModal on load",
      () => {
        const original = window.location;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).location;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).location = {
          ...original,
          search: "?command=edit-metadata",
        } as Location;
        render(<App/>);
        fireEvent.click(screen.getByTestId("start-button"));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).location = original;
      });

    test("EditMetadataModal returns null without context",
      () => {
        render(
          <EditMetadataModal
            isOpen
            onClose={() => {}}/>,
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
  });
