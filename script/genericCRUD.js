class invalidURL extends Error {
    constructor(message = "Invalid URL inserted") {
        super(message);
    }
}

class notOkRequest extends Error { }

function validateURL(url) {
    if (!url) throw new invalidURL();
    if (typeof (url) === "string") {
        try {
            url = new URL(url);
            if (!url.protocol.startsWith("http")) throw new invalidURL("Invalid Protocol Inserted");
            return url;
        }
        catch (error) {
            throw error;
        }
    }
}

function clearDiv(div) {
    const prevChilds = div.childNodes;
    for (let child of prevChilds) {
        div.removeChild(child);
    }
}

function hiddenDiv(div) {
    if (!div.classList.contains("hidden")) {
        div.classList.toggle("hidden");
    }
}

//HTTP request methods: 

function createHTTPoptionsObject(httpMethod, requestBody, contentType = "application/json") {
    if (requestBody) {
        return {
            method: httpMethod,
            mode: 'cors',
            body: requestBody,
            headers: {
                "Content-Type": contentType
            },
        };
    }
    return {
        method: httpMethod
    };
}

async function parseResponse(response) {
    if (response.headers.get("Content-Type").includes("application/json")) {
        return responseValue = await response.json();
    }
    else {
        return responseValue = await response.text();
    }
}

// ---------------------------------------------------


window.addEventListener(
    "load",
    function () {
        const submitButton = this.document.getElementById("submit");
        const resetButton = this.document.getElementById("reset");
        const responseDiv = this.document.getElementById("fullfilled");
        const errorDivResponse = this.document.getElementById("rejected");
        const httpMethod = this.document.getElementById("method");
        // view Methods

        function showError(error) {
            hiddenDiv(responseDiv);
            const errorText = document.createTextNode(`${error.message}`);
            errorDivResponse.appendChild(errorText);
            if (errorDivResponse.classList.contains("hidden")) errorDivResponse.classList.toggle("hidden");
        }

        function showResponse(responseValue) {
            const responseText = document.createTextNode(JSON.stringify(responseValue));
            const responseParagraph = document.createElement("p");
            responseParagraph.appendChild(responseText);
            responseDiv.appendChild(responseParagraph);
        }

        // ---------------------------------------------------

        async function crudCall(url, method, body = null, contentType = null) {
            let reqOptions;
            if (contentType) reqOptions = createHTTPoptionsObject(method, body, contentType);
            else reqOptions = createHTTPoptionsObject(method, body);
            console.log(reqOptions)
            try {
                const response = await fetch(
                    `${url}`,
                    reqOptions
                );

                // check the response type:
                if (response.ok) {
                    const responseValue = await parseResponse(response);

                    if (responseDiv.classList.contains("hidden")) {
                        responseDiv.classList.toggle("hidden");
                    }

                    showResponse(responseValue);
                }
                else {
                    throw new notOkRequest(`Status: ${response.status}`);
                }
            }
            catch (error) {
                if (error instanceof notOkRequest) {
                    throw error;
                }
                throw new invalidURL("Wrong URL inserted");
            }
        }

        httpMethod.addEventListener(
            "change",
            () => {
                const textAreaClassList = document.getElementById("body").classList;
                const textAreaLabelClassList = document.getElementById("bodyLabel").classList;
                if (httpMethod.value === "GET" || httpMethod.value === "DELETE") {
                    if (!textAreaClassList.contains("hidden")) {
                        textAreaLabelClassList.toggle("hidden");
                        textAreaClassList.toggle("hidden");
                    }
                }
                else if (textAreaClassList.contains("hidden")) {
                    textAreaLabelClassList.toggle("hidden");
                    textAreaClassList.toggle("hidden");
                }
            }
        )

        resetButton.addEventListener(
            "click",
            function (e) {
                if (!errorDivResponse.classList.contains("hidden")) {
                    clearDiv(errorDivResponse);
                    errorDivResponse.classList.toggle("hidden");
                }
                if (responseDiv.childNodes.length != 0) { clearDiv(responseDiv) };
                hiddenDiv(responseDiv)
            }
        )

        submitButton.addEventListener(
            "click",
            function (e) {
                e.preventDefault();

                if (!errorDivResponse.classList.contains("hidden")) {
                    clearDiv(errorDivResponse);
                    errorDivResponse.classList.toggle("hidden");
                }
                if (responseDiv.childNodes.length != 0) { clearDiv(responseDiv) };


                const form = new FormData(document.getElementById("form"));

                try {
                    const url = validateURL(form.get("url"));

                    //CRUD call
                    const requestBody = form.get("bodyText");
                    if (httpMethod.value !== "GET" && httpMethod.value !== "DELETE") {
                        if (!requestBody) { throw new Error(`${httpMethod.value} Must have a body!`); }

                        if (document.getElementById("ContentType").checked) {
                            crudCall(url, httpMethod.value, requestBody
                            ).catch(
                                (error) => { showError(error); }
                            );
                        }
                        else {
                            crudCall(url, httpMethod.value, requestBody, "application/text"
                            ).catch(
                                (error) => {
                                    showError(error);
                                }
                            );
                        }
                    } else {
                        crudCall(url, httpMethod.value
                        ).catch(
                            (error) => {
                                showError(error);
                            }
                        );
                    }
                }
                catch (error) {
                    showError(error);
                }
            }
        )
    }
);