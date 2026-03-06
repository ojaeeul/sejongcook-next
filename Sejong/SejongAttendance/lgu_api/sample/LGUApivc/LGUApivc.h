// LGUApivc.h : main header file for the LGUAPIVC application
//

#if !defined(AFX_LGUAPIVC_H__9710D040_20B9_4D3B_BB72_950C09DFD535__INCLUDED_)
#define AFX_LGUAPIVC_H__9710D040_20B9_4D3B_BB72_950C09DFD535__INCLUDED_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000

#ifndef __AFXWIN_H__
	#error include 'stdafx.h' before including this file for PCH
#endif

#include "resource.h"		// main symbols

/////////////////////////////////////////////////////////////////////////////
// CLGUApivcApp:
// See LGUApivc.cpp for the implementation of this class
//

class CLGUApivcApp : public CWinApp
{
public:
	CLGUApivcApp();

// Overrides
	// ClassWizard generated virtual function overrides
	//{{AFX_VIRTUAL(CLGUApivcApp)
	public:
	virtual BOOL InitInstance();
	//}}AFX_VIRTUAL

// Implementation

	//{{AFX_MSG(CLGUApivcApp)
		// NOTE - the ClassWizard will add and remove member functions here.
		//    DO NOT EDIT what you see in these blocks of generated code !
	//}}AFX_MSG
	DECLARE_MESSAGE_MAP()
};


/////////////////////////////////////////////////////////////////////////////

//{{AFX_INSERT_LOCATION}}
// Microsoft Visual C++ will insert additional declarations immediately before the previous line.

#endif // !defined(AFX_LGUAPIVC_H__9710D040_20B9_4D3B_BB72_950C09DFD535__INCLUDED_)
