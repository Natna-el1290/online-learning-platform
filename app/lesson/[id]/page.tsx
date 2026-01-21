import React from "react";

type Props = {
  params: {
    id: string;
  };
};

export default function LessonPage({ params }: Props) {
  const { id } = params;
  return (
    <main>
      <h1>Lesson</h1>
      <p>Lesson id: {id}</p>
    </main>
  );
}
