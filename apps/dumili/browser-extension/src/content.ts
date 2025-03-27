import $ from "jquery";

// Create a container for our app
const $container = $("<div>", { id: "inducks-selector-app" });
$("body").append($container);

// Create the UI elements
const $button = $("<button>", {
  class: "inducks-selector-button",
  text: "Select Option",
});
$container.append($button);

const $modal = $("<div>", {
  class: "inducks-selector-modal",
});
$container.append($modal);

const $textarea = $("<textarea>", {
  class: "inducks-selector-textarea",
  placeholder: "Enter option name",
});
$modal.append($textarea);

const $submitButton = $("<button>", {
  class: "inducks-selector-submit",
  text: "Submit",
});
$modal.append($submitButton);

let isModalVisible = false;

$button.on("click", () => {
  isModalVisible = !isModalVisible;
  $modal.toggleClass("show", isModalVisible);
});

const pickOption = (dropdownName: string, optionValue: string) => {
  const $select = $(`[name='${dropdownName}']`) as JQuery<HTMLSelectElement>;
  if ($select.length) {
    const options = Array.from($select[0].options);
    const matchingOption = options.find(
      (option) => option.value.toLowerCase() === optionValue.toLowerCase(),
    );

    if (matchingOption) {
      $select.val(matchingOption.value);
      $select.trigger("change");
      const selectElement = $select[0];
      selectElement.dispatchEvent(new Event("change", { bubbles: true }));
    }
  } else {
    console.error(`Dropdown with name ${dropdownName} not found`);
  }
};

$submitButton.on("click", () => {
  if ($textarea.val()?.toString().trim()) {
    const url = window.location.href;
    if (url.startsWith("https://inducks.org/onlineinx.php?addissue=1&c=")) {
      pickOption("s", $textarea.val()!.toString().toLowerCase());
    } else {
      pickOption("c", $textarea.val()!.toString().toLowerCase());
    }
  }
  $textarea.val("");
  isModalVisible = false;
  $modal.removeClass("show");
});

$(document).on("click", (event: JQuery.ClickEvent) => {
  if (
    !$modal.is(event.target) &&
    $modal.has(event.target).length === 0 &&
    !$button.is(event.target) &&
    $button.has(event.target).length === 0
  ) {
    isModalVisible = false;
    $modal.removeClass("show");
  }
});
