import { useState, useEffect } from "react";
import { getBlogById, updateBlog } from "../../api/internal";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import TextInput from "../../components/TextInput/TextInput";
import styles from "./UpdateBlog.module.css";

function UpdateBlog() {
  const navigate = useNavigate();
  const params = useParams();

  const blogId = params.id;
  const author = useSelector((state) => state.user._id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState("");

  const getPhoto = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
  };

  useEffect(() => {
    async function getBlogDetails() {
      const response = await getBlogById(blogId);
      if (response.status === 200) {
        setTitle(response.data.blog.title);
        setContent(response.data.blog.content);
        setPhoto(response.data.blog.photo);
      }
    }
    getBlogDetails();
  }, []);

  const updateHandler = async () => {
    let data;
    if (photo.includes("http")) {
      data = {
        author,
        title,
        content,
        blogId,
      };
    } else {
      data = {
        author,
        title,
        content,
        photo,
        blogId,
      };
    }
    const response = await updateBlog(data);
    if (response.status === 200) {
      navigate("/blogs");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>Edit Your Blog</div>
      <TextInput
        type="text"
        name="title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "60%" }}
      />
      <textarea
        className={styles.content}
        placeholder="Content..."
        maxLength={400}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className={styles.photoPrompt}>
        <p>Choose a Photo</p>

        <input
          type="file"
          name="photo"
          id="photo"
          accept="image/jpg, image.jpeg, image/png "
          onChange={getPhoto}
        />
        <img src={photo} width={150} height={150} alt="" />
      </div>
      <button className={styles.update} onClick={updateHandler}>
        Update
      </button>
    </div>
  );
}

export default UpdateBlog;
