"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList, FileText, TrendingUp } from "lucide-react";
import { Progress } from "../../components/ui/progressBar";
import fetchWithAuth from "../../lib/fetchWithAuth";
const ProgressDemo = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  useEffect(() => {
   
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const response = await fetchWithAuth(`${baseUrl}/user/user-progress`);



        if (!response.ok) {
          
          throw new Error(`HTTP error! status: ${response.status}`);
          
          
        }
       


        const data = await response.json();


        setData(data.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (baseUrl) fetchUserData();
  }, [baseUrl]);



 


 
 

  return (
    <div>
      {
        loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#810000]"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="w-full md:w-275 border-2 border-[#7D0000] rounded">
              <div className="bg-[#7D0000] w-full text-white p-2">
                Practice Progress
              </div>
              <div className="bg-[#F2E6E6] p-5 py-10 w-full">
                <div className="bg-white md:flex justify-between gap-2 rounded-xl p-8 md:p-15 w-full">
                <div className="md:border-r-2 grid gap-2 border-r-[#7D0000] pr-2">
                  <h1 className="flex justify-between pr-4 font-medium text-xl">
                    {data?.mockTests?.total}{" "}
                    <span className="bg-amber-400 text-white rounded-full px-2 text">
                      {data?.typeProgress?.speaking}
                    </span>
                  </h1>

                  {/* <div className="inner bg-[#F19F20] w-[50%] h-1"></div> */}
                  <Progress
                    value={parseInt(
                      data?.typeProgress?.speaking.replace("%", ""),
                      10
                    )}
                    color="amber"
                  />

                  <p>Speaking Questions</p>
                </div>
                <div className="md:border-r-2 grid gap-2 border-r-[#7D0000] pr-2">
                  <h1 className="flex justify-between pr-4 font-medium text-xl">
                    {data?.mockTests?.total}{" "}
                    <span className="bg-blue-500 text-white rounded-full px-2 text">
                      {data?.typeProgress?.writing}
                    </span>
                  </h1>
                  <Progress
                    value={parseInt(data?.typeProgress?.writing.replace("%", ""), 10)}
                    color="sky"
                  />
                  <p>Writing Questions</p>
                </div>
                <div className="md:border-r-2 grid gap-2 border-r-[#7D0000] pr-2">
                  <h1 className="flex justify-between pr-4 font-medium text-xl">
                    {data?.mockTests?.total}{" "}
                    <span className="bg-green-500 text-white rounded-full px-2 text">
                      {data?.typeProgress?.reading}
                    </span>
                  </h1>
                  <Progress
                    value={parseInt(data?.typeProgress?.reading.replace("%", ""), 10)}
                    color="green"
                  />
                  <p>Reading Questions</p>
                </div>
                <div className=" grid gap-2  pr-2">
                  <h1 className="flex justify-between pr-4 font-medium text-xl">
                    {data?.mockTests?.total}{" "}
                    <span className="bg-blue-500 text-white rounded-full px-2 text">
                      {data?.typeProgress?.listening}
                    </span>
                  </h1>
                  <Progress
                    value={parseInt(
                      data?.typeProgress?.listening.replace("%", ""),
                      10
                    )}
                    color="blue"
                  />
                  <p>Listening Questions</p>
                </div>
              </div>

              {/* View Practice Progress */}
              <div className="grid gap-2 bg-white mt-5 rounded-2xl p-8">
                <div>
                  <h1 className="font-medium md:text-3xl text-[#7D0000] border-b-2 border-b-[#7D0000]">
                    View Practice Progress
                  </h1>
                </div>
                <div className=" grid gap-5 md:flex md:gap-5 w-full">
                  <div className="md:w-1/2 flex flex-col gap-5">
                    <div className="speaking bg-[#F2E6E6] grid gap-5 rounded-2xl p-5 ">
                      <h1 className="text-amber-500">Speaking</h1>
                      <div className="md:flex justify-between gap-5 text-xs">
                        <div className="left w-full flex flex-col gap-2 md:gap-5">
                          <div className="upper">
                            <p className="flex justify-between">
                              Read Aloud{" "}
                              <span>
                                {data?.typeCounts?.speaking?.read_aloud?.completed}/
                                {data?.typeCounts?.speaking?.read_aloud?.total}
                              </span>
                            </p>

                            {console.log("data?.typeProgress?",data?.typeProgress)
                            }
                            <Progress value={parseInt((data?.typeCounts?.speaking?.read_aloud?.completed / data?.typeCounts?.speaking?.read_aloud?.total) * 100, 10)} color="amber" />

                          </div>
                          <div className="lower">
                            <p className="flex justify-between">
                              Repeat Sentence{" "}
                              <span>
                                {
                                  data?.typeCounts?.speaking?.repeat_sentence
                                    ?.completed
                                }
                                /{data?.typeCounts?.speaking?.repeat_sentence?.total}
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.speaking?.repeat_sentence?.completed / data?.typeCounts?.speaking?.repeat_sentence?.total) * 100, 10)} color="amber" />

                          </div>
                        </div>
                        <div className="right w-full flex flex-col gap-2 md:gap-5">
                          <div className="upper">
                            <p className="flex justify-between">
                              Respond to a Situation{" "}
                              <span>
                                {
                                  data?.typeCounts?.speaking?.respond_to_situation
                                    ?.completed
                                }
                                /
                                {
                                  data?.typeCounts?.speaking?.respond_to_situation
                                    ?.total
                                }
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.speaking?.respond_to_situation?.completed / data?.typeCounts?.speaking?.respond_to_situation?.total) * 100, 10)} color="amber" />

                          </div>
                          <div className="lower">
                            <p className="flex justify-between">
                              Answer Short Question{" "}
                              <span>
                                {
                                  data?.typeCounts?.speaking?.answer_short_question
                                    ?.completed
                                }
                                /
                                {
                                  data?.typeCounts?.speaking?.answer_short_question
                                    ?.total
                                }
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.speaking?.answer_short_question?.completed / data?.typeCounts?.speaking?.answer_short_question?.total) * 100, 10)} color="amber" />

                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="reading bg-[#F2E6E6] grid gap-5 rounded-2xl p-5 ">
                      <h1 className="text-green-500">Reading</h1>
                      <div className="md:flex justify-between gap-5 text-xs">
                        <div className="left w-full flex flex-col gap-2 md:gap-5">
                          <div className="upper">
                            <p className="flex justify-between">
                              Fill in the Blanks{" "}
                              <span>
                                {
                                  data?.typeCounts?.reading
                                    ?.reading_fill_in_the_blanks?.completed
                                }
                                /
                                {
                                  data?.typeCounts?.reading
                                    ?.reading_fill_in_the_blanks?.total
                                }
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.reading?.reading_fill_in_the_blanks?.completed / data?.typeCounts?.reading?.reading_fill_in_the_blanks?.total) * 100, 10)} color="green" />

                          </div>
                          <div className="lower">
                            <p className="flex justify-between">
                              Re-order Paragraphs{" "}
                              <span>
                                {
                                  data?.typeCounts?.reading?.reorder_paragraphs
                                    ?.completed
                                }
                                /
                                {data?.typeCounts?.reading?.reorder_paragraphs?.total}
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.reading?.reorder_paragraphs?.completed / data?.typeCounts?.reading?.reorder_paragraphs?.total) * 100, 10)} color="green" />

                          </div>
                        </div>
                        <div className="right w-full flex flex-col gap-2 md:gap-5">
                          <div className="upper">
                            <p className="flex justify-between">
                              Multiple Choice and answers{" "}
                              <span>
                                {data?.typeCounts?.reading?.mcq_multiple?.completed}/
                                {data?.typeCounts?.reading?.mcq_multiple?.total}
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.reading?.mcq_multiple?.completed / data?.typeCounts?.reading?.mcq_multiple?.total) * 100, 10)} color="green" />

                          </div>
                          <div className="lower">
                            <p className="flex justify-between">
                              Multiple Choice,Single Answer{" "}
                              <span>
                                {data?.typeCounts?.reading?.mcq_single?.completed}/
                                {data?.typeCounts?.reading?.mcq_single?.total}
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.reading?.mcq_single?.completed / data?.typeCounts?.reading?.mcq_single?.total) * 100, 10)} color="green" />

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2 flex flex-col gap-5">
                    <div className="reading bg-[#F2E6E6] grid gap-5 rounded-2xl p-5 ">
                      <h1 className="text-sky-400">Writing</h1>
                      <div className="md:flex justify-between gap-5 text-xs">
                        <div className="left w-full flex flex-col gap-2 md:gap-5">
                          <div className="upper">
                            <p className="flex justify-between">
                              Summarize Written Text{" "}
                              <span>
                                {
                                  data?.typeCounts?.writing?.summarize_written_text
                                    ?.completed
                                }
                                /
                                {
                                  data?.typeCounts?.writing?.summarize_written_text
                                    ?.total
                                }
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.writing?.summarize_written_text?.completed / data?.typeCounts?.writing?.summarize_written_text?.total) * 100, 10)} color="sky" />

                          </div>
                        </div>
                        <div className="right w-full flex flex-col gap-2 md:gap-5">
                          <div className="upper">
                            <p className="flex justify-between">
                              Write Email{" "}
                              <span>
                                {data?.typeCounts?.writing?.write_email?.completed}/
                                {data?.typeCounts?.writing?.write_email?.total}
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.writing?.write_email?.completed / data?.typeCounts?.writing?.write_email?.total) * 100, 10)} color="sky" />

                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="speaking bg-[#F2E6E6] grid gap-5 rounded-2xl p-5 ">
                      <h1 className="text-blue-500">Listening</h1>
                      <div className="md:flex justify-between gap-5 text-xs">
                        <div className="left w-full flex flex-col gap-2 md:gap-5">
                          <div className="upper">
                            <p className="flex justify-between">
                              Summarize Spoken Text{" "}
                              <span>
                                {
                                  data?.typeCounts?.listening?.summarize_spoken_text
                                    ?.completed
                                }
                                /
                                {
                                  data?.typeCounts?.listening?.summarize_spoken_text
                                    ?.total
                                }
                              </span>
                            </p>
                           <Progress value={parseInt((data?.typeCounts?.listening?.summarize_spoken_text?.completed / data?.typeCounts?.listening?.summarize_spoken_text?.total) * 100, 10)} color="blue" />

                          </div>
                          <div className="lower">
                            <p className="flex justify-between">
                              Fill in the blanks <span>
                                {
                                  data?.typeCounts?.listening?.listening_fill_in_the_blanks
                                    ?.completed
                                }
                                /
                                {
                                  data?.typeCounts?.listening?.listening_fill_in_the_blanks
                                    ?.total
                                }
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.listening?.listening_fill_in_the_blanks?.completed / data?.typeCounts?.listening?.listening_fill_in_the_blanks?.total) * 100, 10)} color="blue" />

                          </div>
                        </div>
                        <div className="right w-full flex flex-col gap-2 md:gap-5">
                          <div className="upper">
                            <p className="flex justify-between">
                              Multiple Choice and answers <span>

                                {
                                  data?.typeCounts?.listening?.listening_multiple_choice_multiple_answers

                                    ?.completed
                                }
                                /
                                {
                                  data?.typeCounts?.listening?.listening_multiple_choice_multiple_answers

                                    ?.total
                                }
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.listening?.listening_multiple_choice_multiple_answers?.completed / data?.typeCounts?.listening?.listening_multiple_choice_multiple_answers?.total) * 100, 10)} color="blue" />

                          </div>
                          <div className="lower">
                            <p className="flex justify-between">
                              Multiple Choice,Single Answer <span>

                                {
                                  data?.typeCounts?.listening?.listening_multiple_choice_single_answers


                                    ?.completed
                                }
                                /
                                {
                                  data?.typeCounts?.listening?.listening_multiple_choice_single_answers


                                    ?.total
                                }
                              </span>
                            </p>
                            <Progress value={parseInt((data?.typeCounts?.listening?.listening_multiple_choice_single_answers?.completed / data?.typeCounts?.listening?.listening_multiple_choice_single_answers?.total) * 100, 10)} color="blue" />

                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="reading bg-[#F2E6E6] grid gap-5 rounded-2xl p-5 ">
                      <h1 className="text-red-900">Mock Test</h1>
                      <div className="md:flex justify-between gap-5 text-xs">
                        <div className="left w-full flex flex-col gap-2 md:gap-5">
                          <div className="upper">
                            <p className="flex justify-between">
                              Full Mock Test <span>
                                {
                                  data?.mockTests?.completed
                                }
                                /
                                {
                                  data?.mockTests?.total
                                }
                              </span>
                            </p>
                            <Progress value={parseInt((data?.mockTests?.completed / data?.mockTests?.total) * 100, 10)} color="red" />

                          </div>
                        </div>
                        <div className="right w-full flex flex-col gap-2 md:gap-5">
                          <div className="upper">
                            <p className="flex justify-between">
                              Sectional Mock Test <span>
                                {
                                  console.log("data?.sectionalMockTests?",data?.sectionalMockTests)
                                  
                                }

                                {
                                  data?.sectionalMockTests?.completed
                                }
                                /
                                {
                                  data?.sectionalMockTests?.total
                                }

                              </span>
                            </p>
                            <Progress value={parseInt((data?.sectionalMockTests?.completed / data?.sectionalMockTests?.total) * 100, 10)} color="red" />

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/templates"
                className="group flex items-center justify-center rounded-2xl bg-[#F7A6C5] px-6 py-6 text-white shadow-sm transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#E85C8A]">
                    <FileText className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-medium">Templates</span>
                </div>
              </Link>
              <Link
                href="/predictions"
                className="group flex items-center justify-center rounded-2xl bg-[#86E6D9] px-6 py-6 text-white shadow-sm transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#35C3B1]">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-medium">Predictions</span>
                </div>
              </Link>
              <Link
                href="/mock-test"
                className="group flex items-center justify-center rounded-2xl bg-[#A8A8FF] px-6 py-6 text-white shadow-sm transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#6B6BDE]">
                    <ClipboardList className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-medium">Mock tests</span>
                </div>
              </Link>
            </div>
          </div>
        )
      }
    </div>
    // <div></div>
    
  );
};

export default ProgressDemo;
