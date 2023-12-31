import React from "react";
import { useNavigate } from "react-router-dom";
import ToggleFriendButton from "./ToggleFriendButton";
import { formatDistance } from "date-fns";

const UserBasicInfo = ({
  className,
  user,
  extraInfo,
  extraInfoClassName,
  handleOnClick,
  showToggleFriend,
  timeStamp,
  dense,
}) => {
  const { _id, firstName, lastName, image } = user ?? {};
  const navigate = useNavigate();
  const handleNavigateProfilePublicPage = (userId) => {
    navigate(`/profile/public/${userId}`);
    if (handleOnClick) handleOnClick();
  };

  const handleOnClickDate = (e) => {
    e.stopPropagation();
  };

  if (!_id) {
    return null;
  }
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={() => handleNavigateProfilePublicPage(_id)}
        className={`flex items-center gap-3 w-full`}
      >
        <img
          className={`rounded-full object-cover shrink-0 ${
            dense ? "w-12 h-12" : "w-14 h-14"
          }`}
          src={image?.url || "https://placehold.co/60x60/png"}
        />
        <div
          className={`text-left antialiased flex-grow ${
            dense ? "text-sm" : "text-md"
          }`}
        >
          <div className="flex justify-between">
            <p className="font-semibold">
              {firstName} {lastName}
            </p>
            {timeStamp && (
              <p
                onClick={handleOnClickDate}
                className="text-xs text-neutral-400 hover:cursor-default"
              >
                {formatDistance(new Date(timeStamp), new Date(), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
          {extraInfo && (
            <p
              onClick={handleOnClickDate}
              className={`${extraInfoClassName} hover:cursor-default`}
            >
              {extraInfo}
            </p>
          )}
        </div>
      </button>
      {showToggleFriend && <ToggleFriendButton user={user} />}
    </div>
  );
};

export default UserBasicInfo;
