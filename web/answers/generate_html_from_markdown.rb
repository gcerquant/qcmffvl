#!/usr/bin/env ruby


require 'find'


def execute_pandoc_command(resource_path, markdown_input_file, html_output_file)

	pandoc_command = "/usr/local/bin/pandoc --css #{__dir__}/pandoc.css --self-contained --resource-path #{resource_path} #{markdown_input_file} --output=#{html_output_file}"

	puts "Will run:\n\t#{pandoc_command}"

	`#{pandoc_command}`

	if ($?.exitstatus != 0)
		abort("FAILED: with #{pandoc_command}")
	end

	puts "\n\n"
end

def generate_html_from_linked_question(reference_link_input_file)
	puts "\n\nQUESTION #{File.dirname(reference_link_input_file).split(File::SEPARATOR).last}"

	puts "File #{reference_link_input_file}"


	html_output_file = File.dirname(reference_link_input_file) + "/explanation.md.html"

	linked_answer = File.basename(reference_link_input_file, ".ref")

	puts "\t\tlinking to #{linked_answer}"

#	puts "\tanswer linking to #{linked_markdown_input_file}"

	resource_path = File.expand_path(File.dirname(reference_link_input_file) + "/../" + linked_answer)
	execute_pandoc_command(resource_path, resource_path + "/explanation.md", html_output_file)

#puts "Explanation for question #{current_folder}"

	puts "\n\n"


end

def generate_html_from_markdown(markdown_input_file) # html_output_file
	puts "\n\nQUESTION #{File.dirname(markdown_input_file).split(File::SEPARATOR).last}"


	puts "File #{markdown_input_file}"

	html_output_file = markdown_input_file + ".html"

	resource_path= File.dirname(markdown_input_file)

	execute_pandoc_command(resource_path, markdown_input_file, html_output_file)


end


only_this_question_ID = ARGV[0]

if ! only_this_question_ID.nil?
	puts "Only generating question #{only_this_question_ID}"
end




all_answers = Array.new;

puts "#{__dir__}"

Find.find(__dir__) do |a_file|

	next if ! FileTest.directory?(a_file)

	a_folder = a_file

	current_question_number =  File.basename(a_folder) # .split(File::SEPARATOR).last

	# Allow to generate only one question
	if ! only_this_question_ID.nil?
		if only_this_question_ID != current_question_number
			next
		end
	end

	if ! current_question_number.match? /^[AELNSU][0-9]+V$/
		puts "skipping #{current_question_number} (invalid format for question ID)" unless ["answers", "_template", "_template_link", "BI", "BP", "BPC" ].include?(current_question_number)
		next
#		puts "skipping Folder #{current_folder} not ok with convention"
#		abort("Folder #{current_folder} not ok with convention")
	end

	puts "Current question #{current_question_number}"

	if File.file?("#{a_folder}/explanation.md")
		generate_html_from_markdown("#{a_folder}/explanation.md") 
		
		all_answers.push(current_question_number);
	else 

		# Explanation referencing an other question
#		puts "looking for *.ref in #{current_folder}"

		reference_file=Dir[File.join(a_folder, '*.ref')].first
		puts "Reference got: #{reference_file}"

		if File.file?(reference_file)

			puts "answers link to: #{reference_file}"


			generate_html_from_linked_question(reference_file) 

			all_answers.push(current_question_number);
			puts "\n\n"
		end
	end
end

# 27/(320 + 169 + 143) × 100

puts "\n\n\n\n\n\n In controllers.js, update function $scope.questionHasExplanation ==>"
puts "return #{all_answers}.includes(question.code);"; 
puts "\n\n\n\n\n\n\n\n\n"

#puts "return [" + all_answers.map { |i| "\"" + i.to_s + "\"" }.join(", ") + "].includes(question.code);";
#         return ["A22V", "L3V", "L5V", "N27V", "N30V", "N33V", "N38V", "N61V", "N62V", "N63V", "S106V", "S107V", "S108V", "S109V", "S111V", "S112V", "S113V", "S114V", "S115V", "S19V", "S46V", "S96V", "U90V"].includes(question.code);
