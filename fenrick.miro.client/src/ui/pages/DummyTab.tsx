import React from "react";
import { TabPanel } from "../components/TabPanel";
{
  TabTuple
}
from;
"./tab-definitions";

/** Dummy tab for testing auto-registration. */
export const DummyTab: React.FC = () => (
  <TabPanel tabId='dummy'>
    <div data-testid='dummy'>Dummy</div>
  </TabPanel>
);

export const tabDef: TabTuple = [
  99,
  "dummy",
  "Dummy",
  "Test only dummy tab",
  DummyTab,
];
