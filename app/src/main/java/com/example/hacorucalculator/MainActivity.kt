package com.example.hacorucalculator

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.hacorucalculator.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.calcButton.setOnClickListener {
            calculateHacorU()
        }
    }

    private fun calculateHacorU() {
        val hacor = binding.hacorInput.text.toString().toDoubleOrNull() ?: 0.0
        val sofa = binding.sofaInput.text.toString().toDoubleOrNull() ?: 0.0

        var hacorU = hacor + (0.5 * sofa)

        if (binding.pneumonia.isChecked) hacorU += 2.5
        if (binding.cpe.isChecked) hacorU -= 4.0
        if (binding.ards.isChecked) hacorU += 3.0
        if (binding.immuno.isChecked) hacorU += 1.5
        if (binding.septicShock.isChecked) hacorU += 2.5

        val risk = when {
            hacorU <= 7 -> "Low probability of NIV failure"
            hacorU <= 10.5 -> "Moderate probability of NIV failure"
            hacorU <= 14 -> "High probability of NIV failure"
            else -> "Very high probability of NIV failure"
        }

        binding.resultText.text =
            "HACOR-U Score: %.1f\n$risk".format(hacorU)
    }
}
