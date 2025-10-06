export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId).populate('user', 'username fullName');

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      // Handle like notification cleanup or update
      const updatedPost = await Post.findById(postId);
      const remainingLikes = updatedPost.likes.length;

      if (remainingLikes === 0) {
        // Remove notification if no likes left
        await Notification.findOneAndDelete({
          to: post.user._id,
          type: "like",
          post: postId,
        });
      } else if (post.user._id.toString() !== userId.toString()) {
        // Update existing notification with new like count
        const firstLiker = await User.findById(updatedPost.likes[0]).select('username fullName');
        const message =
          remainingLikes === 1
            ? `${firstLiker.fullName || firstLiker.username} liked your post`
            : `${firstLiker.fullName || firstLiker.username} and ${
                remainingLikes - 1
              } other${remainingLikes > 2 ? 's' : ''} liked your post`;

        await Notification.findOneAndUpdate(
          { to: post.user._id, type: "like", post: postId },
          { message: message, read: false },
          { new: true }
        );
      }

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      return res.status(200).json(updatedLikes);
    } else {
      // Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      // Only create notification if not liking own post
      if (post.user._id.toString() !== userId.toString()) {
        const updatedPost = await Post.findById(postId);
        const likeCount = updatedPost.likes.length;

        const liker = await User.findById(userId).select('username fullName');

        const message =
          likeCount === 1
            ? `${liker.fullName || liker.username} liked your post`
            : `${liker.fullName || liker.username} and ${
                likeCount - 1
              } other${likeCount > 2 ? 's' : ''} liked your post`;

        // Check if a notification already exists for this post
        const existingNotification = await Notification.findOne({
          to: post.user._id,
          type: "like",
          post: postId,
        });

        if (!existingNotification) {
          const notification = new Notification({
            from: userId,
            to: post.user._id,
            type: "like",
            post: postId,
            message,
          });
          await notification.save();
        } else {
          existingNotification.message = message;
          existingNotification.from = userId; // Show latest liker
          existingNotification.read = false;
          existingNotification.createdAt = new Date();
          await existingNotification.save();
        }
      }

      return res.status(200).json(post.likes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
