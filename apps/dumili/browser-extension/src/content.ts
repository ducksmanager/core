import $ from "jquery";
import useTextEditor from "~dumili/src/composables/useTextEditor";
import contentHtml from "./content.html?raw";
import "./style.scss";

const { unText } = useTextEditor();

const container = $(contentHtml);
$("body").append(container);

const button = $("#dumili-modal-trigger");
const modal = $("#dumili-modal");

button.on("click", () => {
  modal.toggleClass("hidden");
});

const pickOption = (dropdownName: string, optionValue: string) => {
  const select = $<HTMLSelectElement>(`[name='${dropdownName}']`);
  if (select.length) {
    const options = Array.from(select[0].options);
    const matchingOption = options.find(
      (option) => option.value.toLowerCase() === optionValue.toLowerCase(),
    );

    if (matchingOption) {
      select.val(matchingOption.value);
      select.trigger("change");
      select[0].dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      window.alert(
        `Option with value ${optionValue} in dropdown ${dropdownName} not found`,
      );
    }
  } else {
    window.alert(`Dropdown with name ${dropdownName} not found`);
  }
};

modal.find("button#next").on("click", () => {
  const textarea = modal.find("textarea");
  const data = unText(textarea.val()?.toString().trim());
  if (data) {
    const params = new URLSearchParams(window.location.search);
    const countrycode = params.get("c");
    if (!countrycode) {
      window.alert("Select a country first");
      return;
    }
    const [magazinecode, issuenumber] = data[0].entrycode.split(" ");
    if (!params.get("s")) {
      pickOption("s", magazinecode);
    } else {
      pickOption("issNotInInducks", issuenumber);
    }
  }
});

$(document).on("click", (event: JQuery.ClickEvent) => {
  if (
    !modal.is(event.target) &&
    modal.has(event.target).length === 0 &&
    !button.is(event.target) &&
    button.has(event.target).length === 0
  ) {
    modal.removeClass("show");
  }
});
