# robofill

A chrome browser extension that helps you save the work you put in typing values into a form/page and then replay those values onto the same form. This is beneficial for repetitive tasks where the web pages don't give you any ability to reuse the values you typed in.

This tool is currently in alpha release. We have been able to test this tool on limited number of job application sites. But, this tool is generic enough that it can be used across any type of web page.

We played around with other tools in the Chrome store. None of them were open source and ones we found did not address the workflow we hoped for.


# Things to keep to be aware of

1. The HTML rendering landscape is very complex and this tool may be not perfectly always. Please feel free to submit as Github Issue, if you think this tool should support certain usecases which it is not currently supporting.

2. The tool cannot save/replay certain values
  a. File Attachments: This still has to be done manually, since the there are security implications in automating this.
  b. Dynamic Generated Fields: On same web pages, certain fields are only rendered when a corresponding option is chosen from previously rendered fields. The current version of this tool does not support those scenarios. Possibly, we can do better in the future.
  
# Why I built this tool

We built this tool to solve one of the repetitive tasks I realized I was goind while applying for jobs I was interested in. Typically, we ended up typing  in the same demographic and general information into the same job sites and same set of form fields. The reason these job sites are not able to share the information is because the pages are rendered for different customers and the are not able to shared the data. It is beneficial to the customer's but not to job applicants.

# What are the other tools solve a similar problem

There is already an [Autofill](https://chrome.google.com/webstore/detail/autofill/nlmmgnhgdeffjkdckmikfpnddkbbfkkk?hl=en) tool that you can try. This tool has been around and some features like adding rules that the current version of `robofill` does not support. Note, that the tool is not open source. That was one other motivation for us to build this tool.

# Known Issues that needs improvements

1. This is the alpha version of tool. So you is at your own risk.
2. The repo is missing tests. We plan to add them as we move this initial version into Typescript.
3. Created profiles cannot be deleted yet. Future versions will support that.
4

