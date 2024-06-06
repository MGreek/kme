import Editor from "./components/Editor";

export default function App() {
  return (
    <Editor
      staffSystemId={null}
      pageGap={20}
      pagePadding={{
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
      }}
    />
  );
}
