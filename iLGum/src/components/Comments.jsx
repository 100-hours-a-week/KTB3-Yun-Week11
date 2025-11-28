import { useState } from "react";
import { apiFetch } from "../api/common";
import { CommentForm } from "./CommentForm";
import { CommentsList } from "./CommentsList";
import { ConfirmModal } from "./Modal";

export default function Comments({ postId, initialComments }) {
  const [comments, setComments] = useState(initialComments);
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetId, setTargetId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const content = input.trim();
    if (!content) return;

    try {
      if (editing) {
        const res = await apiFetch(`/posts/${postId}/comments/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({ content }),
        });

        if (res.ok) {
          setComments((prev) =>
            prev.map((c) =>
              c.commentId === editing.id ? { ...c, content } : c
            )
          );
          setEditing(null);
          setInput("");
        }

        if (res.status === 403) {
          alert("작성자만 수정할 수 있습니다.");
          return;
        }
      } else {
        const res = await apiFetch(`/posts/${postId}/comments`, {
          method: "POST",
          body: JSON.stringify({ content }),
        });
        if (res.ok) {
          const body = await res.json();
          const created = body?.data ?? body;
          setComments((prev) => [created, ...prev]);
          setInput("");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (id, content) => {
    setEditing({ id, content });
    setInput(content);
  };

  const openDeleteModal = (id) => {
    setTargetId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!targetId) return;

    try {
      const res = await apiFetch(`/posts/${postId}/comments/${targetId}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        setComments((prev) => prev.filter((c) => c.commentId !== targetId));
        setShowDeleteModal(false);
        setTargetId(null);
      }
      if (res.status === 403) {
        alert('작성자만 삭제할 수 있습니다.')
        return
      }
    } catch (err) {
      console.log(err);
    }
  };

  const isDisabled = !input.trim();

  return (
    <>
      <CommentForm
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={isDisabled}
      />
      <CommentsList
        comments={comments}
        onEdit={handleEdit}
        onDelete={openDeleteModal}
      />
      <ConfirmModal
        open={showDeleteModal}
        title="댓글을 삭제하시겠습니까?"
        message="삭제한 내용은 복구할 수 없습니다."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
