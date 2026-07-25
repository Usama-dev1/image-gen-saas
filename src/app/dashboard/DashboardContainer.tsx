import { DashboardView, Generation } from "./DashboardView";

export function DashboardContainer() {
  // Mock data fetching, replacing the hardcoded list in page.tsx
  const credits = 1240;
  const recentGenerations: Generation[] = [
    {
      id: "1",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLClAfDwMb2e6Nj5dujHWti_fDZz8_z_yOwWt6lKiaEZLQBtQyzX0-MuNg9jJM2qV-MhLcETzHSeud0uO7L2lwAc2awSM3B7EUYmPuVI0YwFhufr7En_6bYAgxgcdr7R8x3BfI4kOrbWaYAQ2VXBxiBOZVBSjC-JTvrwR0qYuv88WppCumyno9e-er_VdeMPLrWl1MY4hqRtB0hsMlYu14VMzqnQPBnrRKs3Dxw2GWkmc9iC8orNHt",
      label: "Generated • 2m ago",
      desc: "Elara Voss standing on snowy peak, distant ruined castle...",
      featured: true,
    },
    {
      id: "2",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYBzcE4CTHiklvKtdHlfXFV8hdD5bucOPTC1UC8c5rrFL1lZD_TKKlpw_IRAj8v0zILPspakEFyFq3wAnRqxtxpLYTxJf5yJWLYzD0uIFznrh0JRugeaVDcjPTBrXuRi8pbLqyM9X6wXux8WS8cdVfyyuwAzrdR6Td_AIRmkP-IC2awxyna_Y8wNzjdbVo4192M-f-3uO18p9MP3yUqyghmtYZ6f00AjgH6W6-uxa6uUFqybdkUIim",
    },
    {
      id: "3",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiCoQ3WD8a8v5bB4Af8O1SxTxAXfCq8FqXw8NqVkA8VoNB_YCKB_zKFHepz5vZ4MCaQSsyNCL7MInESws1BVthP6yylW95ZXlye2eIwWvd4DdT_-zDF3lz-pEczlr-3CtsRX57XqzDtrB5g7ArpThEnnkA5rkeZQTRyshMFB6U7lqrsa84C-maRSmj1VxyJ5ZmKsFARRYjOVW1inLHHpFqwTDS_-EqpeGyiXhgotkI0fs-Cx-kDTTT",
    },
    {
      id: "4",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmKHa8pxB7k17ididvquxsx0KV1JuK8hrMmkea6jPQ67ATJKf3A9sOz9XC5QmiLZ8K0xw-xerJmcAR4eFNyQshuVWQIcWOvaLTkoMCZiEi_mV31i0tzOzAT0P8r0Ao9CuSDZDKXwPQPEi48NMPAaLJjDCquZdkP1nLSoMmmM4CClfdw2wdOl-3mUYrcZTgbv3AST2W-K9f_PN2yoRc3OoVbc5SDi7UMk3r68n-ZtPiC16_JWg7v_lw",
      wide: true,
    },
  ];

  return <DashboardView credits={credits} recentGenerations={recentGenerations} />;
}
