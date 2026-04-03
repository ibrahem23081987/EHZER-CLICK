import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { QuestionnairePage } from './pages/QuestionnairePage'
import { DocumentUploadPage } from './pages/DocumentUploadPage'
import { ThankYouPage } from './pages/ThankYouPage'
import { HandoffPage } from './pages/HandoffPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="questionnaire" element={<QuestionnairePage />} />
          <Route path="upload" element={<DocumentUploadPage />} />
          <Route path="handoff" element={<HandoffPage />} />
          <Route path="thank-you" element={<ThankYouPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
