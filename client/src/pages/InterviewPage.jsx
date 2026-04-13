import React from 'react'
import Step1Setup from '../components/Step1Setup';
import Step2Interview from '../components/Step2Interview';
import Step3InterviewReport from '../components/Step3InterviewReport';

function InterviewPage() {
  const [step,setsetep] = React.useState(1);
  const [interviewData,setInterviewData] = React.useState(null);
  const [report,setReport] = React.useState(null);
  return (
    <div className='min-h-screen bg-gray-50'>
      {step===1 && (<Step1Setup  onStart={(data)=>{setInterviewData(data);
        setsetep(2);
      }}/>)}
      {step==2 && (<Step2Interview  interviewData={interviewData}
      onFinish={(report)=>{setInterviewData(report);
        setsetep(3);
      }}/>)}
      {step==3 && (<Step3InterviewReport report={interviewData}/>)}
    </div>
  )
}
export default InterviewPage