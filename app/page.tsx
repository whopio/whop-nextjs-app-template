import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Whop App
          </h1>
          <p className="text-lg text-gray-600">
            Follow these steps to get started with your Whop application
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white mr-3">
                1
              </span>
              Create Your Whop App
            </h2>
            <p className="text-gray-600 ml-11">
              Go to your{" "}
              <a
                href="https://whop.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Whop Dashboard
              </a>{" "}
              and create a new app in the Developer section.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white mr-3">
                2
              </span>
              Set Up Environment Variables
            </h2>
            <p className="text-gray-600 ml-11 mb-4">
              Copy the .env file from your dashboard and create a new .env file
              in your project root. This will contain all the necessary
              environment variables for your app.
            </p>
            <div className="text-gray-600 ml-11">
              <code>
                WHOP_API_KEY= {process.env.WHOP_API_KEY} <br />
                MY_USER_ID= {process.env.MY_USER_ID} <br />
                WHOP_APP_ID= {process.env.WHOP_APP_ID}
              </code>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white mr-3">
                3
              </span>
              Install Your App into your whop
            </h2>
            <p className="text-gray-600 ml-11">
              {process.env.WHOP_APP_ID ? (
                <a
                  href={`https://whop.com/apps/${process.env.WHOP_APP_ID}/install`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 underline"
                >
                  Click here to install your app
                </a>
              ) : (
                <span className="text-amber-600">
                  Please set your environment variables to see the installation
                  link
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Need help? Visit the{" "}
            <a
              href="https://dev.whop.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              Whop Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
